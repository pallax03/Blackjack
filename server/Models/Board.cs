using Newtonsoft.Json;
using WebSocketSharp;
using WebSocketSharp.Server;

#nullable disable

public class Board : WebSocketBehavior
{
    //list of websocket ~ 1 websocket = 1 client
    private static List<WebSocket> _clientSockets = new List<WebSocket>();

    //list of boolean, parallel of clientsocket list
    private static List<bool> _clientready = new List<bool>();

    //Game Variables
    public static List<Player> _players = new List<Player>();//Players list, with this class i have the full control of the game (name, chat history, score and socket).
    private static NewDeck _jsonNewDeck = new NewDeck();//Deck Obj
    private static DrawCard _jsonDrawCard = new DrawCard();//Drawed Card Obj
    private static int whosturn=0;
    private static bool game_started=false;
    private static Player.Card backcard = new Player.Card("BC","https://deckofcardsapi.com/static/img/back.png".ToUri(),"0");

    public void SetDealer()
    {
        _players.Add(new Player(0, "Dealer", 0));//player 0 is the dealer
    }

    protected override void OnOpen()
    {
        //it only accepts a maximum of 7 clients
        if (_clientSockets.Count > 6)
        {
            Console.WriteLine("Chiusa connessione con client: " + (_clientSockets.Count + 1).ToString()+ "(board)");
            Context.WebSocket.Close();
        }
        else 
        {
            if(_clientSockets.Count==0)
                SetDealer();

            _clientSockets.Add(Context.WebSocket);
            _clientready.Add(false);
            _players.Add(new Player(_players.Count, Context.WebSocket));
            Context.WebSocket.Send("idClient|"+(_players.Count-1));
        }
    }
    protected override void OnMessage(MessageEventArgs e)//here, I handle all messages
    {
        if(game_started)
        {
            if(e.Data.Contains("|ready|"))//the client put his state on ready
            {
                string[] splitted = e.Data.Split("|");
                _players[FindPlayer(Context.WebSocket)].Initialize(splitted[0], 0, Convert.ToDouble(splitted[2]));//add other information of the player (name, number of cards in his hand)
            }
            if(Context.WebSocket ==_players[whosturn].Socket)
            {
                if(e.Data == "|bet|")//the client bet
                {
                    
                }
                else if(e.Data == "|card|")//the client request a card
                {
                    GiveCard();
                    if(_players[whosturn].Score>=21)
                        GoNext();
                }
                else if(e.Data == "|stop|")//the client stop his turn
                {
                    GoNext();
                }

            }
        }
        else
        {
            if(e.Data.Contains("|ready|"))//the client put his state on ready
            {
                string[] splitted = e.Data.Split("|");
                _players[FindPlayer(Context.WebSocket)].Initialize(splitted[0], 0, Convert.ToDouble(splitted[2]));//add other information of the player (name, number of cards in his hand)
                SetReadyState(Context.WebSocket);//Set the player ready
            }
        }


    }
    public void SendToAll(string message)//Send a message to all the clients
    {
        foreach (var socket in _clientSockets)
        {
            socket.Send(message);
        }
    }
    public void SetReadyState(WebSocket socket)
    {
        int nready=0;//count how many players they have set up --initialization

        for (int i = 0; i < _clientSockets.Count; i++)//search the correct client socket index
        {
            if(socket==_clientSockets[i])//set the client ready in the parrarel bool list
                _clientready[i]=true;

            if(_clientready[i]==true)//count how many players they have set up --storage
                nready++;
        }
        SendToAll($"numberofplayers|{nready}|{_clientready.Count}");//Send to all client the state of ready players
        ControlReadyState();//Control if all the players set ready
    }
    public void ControlReadyState()
    {
        bool start=true;
        for (int i = 0; i < _clientready.Count && start==true; i++)
        {
            if (_clientready[i]==false)//if any of the client is not ready the variable start go false
            {
                start=false;
            }
        }
        if(start)//so the method is not called
            StartGame();
    }

    public void StartGame()//Start the game
    {
        for (int i = 0; i < _clientready.Count; i++)//Reset Ready State
            _clientready[i]=false;

        Console.WriteLine("\nGAME START");
        SendToAll("|start|");
        game_started=true;
        whosturn=_players.Count-1;
        //call deck API
        var url = new Uri("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
        using (var client = new HttpClient())//api that set up the deck
        {
            //I want to contact with a GET
            var getResult = client.GetAsync(url).Result;
            var getResultJson = getResult.Content.ReadAsStringAsync().Result;
            _jsonNewDeck = JsonConvert.DeserializeObject<NewDeck>(getResultJson);//storage the Deck Obj
            //useful to know the deck_id to manage the deck with other calls to the api
        }
        Console.WriteLine("Deck id: "+_jsonNewDeck.deck_id+"\n"); //Debug
        GiveCards();//gives the two starting cards to each player
    }
    public void GiveCards()
    {
        //call card API
        var url = new Uri($"https://deckofcardsapi.com/api/deck/{_jsonNewDeck.deck_id}/draw/?count=2");
        for (int i = 0; i < _players.Count; i++)
        {
            using (var client = new HttpClient())//api that request 2 cards
            {
            //I want to contact with a GET
            var getResult = client.GetAsync(url).Result;
            var getResultJson = getResult.Content.ReadAsStringAsync().Result;
            _jsonDrawCard = JsonConvert.DeserializeObject<DrawCard>(getResultJson);//storage the Drawed Card Obj ;

            for (int j = 0; j < _jsonDrawCard.Cards.Length; j++)//adds as many cards as the json sends him
                _players[i].AddCard(_jsonDrawCard.Cards[j].Code,_jsonDrawCard.Cards[j].Image,_jsonDrawCard.Cards[j].Value);
            
            if(i>0)
                SendToAll("player|"+SharePlayer(i));//Send to the client the json, he need that for visualize all the player variables.
                

            Console.WriteLine($"Name: {_players[i].Name}, Score: {_players[i].Score}, Bet: "+_players[i].Bet);
            }
        }
        _players[0].Ncards=1;
        SendToAll("player|"+SharePlayer(0));
        Console.WriteLine("");
        
        if(_players[whosturn].Score>=21)
            GoNext();
        else
            WhosNext();
    }

    public void GiveCard()
    {
        //call card API
        var url = new Uri($"https://deckofcardsapi.com/api/deck/{_jsonNewDeck.deck_id}/draw/?count=1");
        using (var client = new HttpClient())//api that request a card
        {
        //I want to contact with a GET
        var getResult = client.GetAsync(url).Result;
        var getResultJson = getResult.Content.ReadAsStringAsync().Result;
        _jsonDrawCard = JsonConvert.DeserializeObject<DrawCard>(getResultJson);//storage the Drawed Card Obj
        _players[whosturn].AddCard(_jsonDrawCard.Cards[0].Code,_jsonDrawCard.Cards[0].Image,_jsonDrawCard.Cards[0].Value);//adds as many cards as the json sends him
        SendToAll("player|"+SharePlayer(whosturn));//Send to the client the json, he need that for visualize all the player variables.
        }
    }

    public void WhosNext()
    {
        SendToAll("whoactive|"+whosturn);
        _players[whosturn].Socket.Send("|yourturn|");
    }
    public void GoNext()
    {
        Console.Write($"Name: {_players[whosturn].Name}, ");
        for (int i = 0; i < _players[whosturn].Ncards; i++)
            Console.Write($"Card {i+1}: {_players[whosturn].Cards[i].Value}, ");
        Console.Write($"Score: {_players[whosturn].Score}, Bet: {_players[whosturn].Bet}\n");

        _players[whosturn].Socket.Send("|stop|");
        whosturn--;//avanza di persona nel turno
        if(whosturn==0)
            DealerTurn();
        else
        {
            if(_players[whosturn].Score==21)
                GoNext();
            else
                WhosNext();
        }
            
    }
    public int FindPlayer(WebSocket socket)//search for a player given the socket
    {
        for (int i = 0; i < Board._players.Count; i++)
        {
            if(Board._players[i].Socket==socket)
                return i;
        }
        return 0;
    }
    public string SharePlayer(int who)//make the json to share information of clients
    {
        var _jsonPlayer="";
        if(_players[who].Ncards==1)//Hide the second card of the dealer if he got only 1 card
        {
            Player.Card second_card = new Player.Card(_players[who].Cards[_players[who].Ncards].Code, _players[who].Cards[_players[who].Ncards].Image, _players[who].Cards[_players[who].Ncards].Value);
            _players[who].Cards[_players[who].Ncards]=backcard;
            _players[who].Ncards=2;//Dice che ne ha due in modo che iul client ne mostra due
            _jsonPlayer = JsonConvert.SerializeObject(_players[who]);//convert the player class to a json
            _players[who].Ncards=1;//ma comunque all'interno del server la reimposto come una per riscriverla
            _players[who].Cards[_players[who].Ncards]=second_card;
        }
        else if(who!=0)
        {
            WebSocket socket = _players[who].Socket;
            _players[who].Socket=null;
            _jsonPlayer = JsonConvert.SerializeObject(_players[who]);
            _players[who].Socket= socket;
        }
        else
            _jsonPlayer = JsonConvert.SerializeObject(_players[who]);//convert the player class to a json

        return _jsonPlayer;
    }
    public void DealerTurn()
    {
        SendToAll("whoactive|"+whosturn);
        _players[0].Ncards=2;//Scopre la carta del dealer
        //richiede un altra carta il dealer se il punteggio non supera 16
        while (_players[0].Score<=16)
            GiveCard();
        WhoWin();
    }
    public void WhoWin()
    {
        Console.WriteLine("\nEND GAME\n");
        int winners=0;
        for (int i = 1; i < _players.Count; i++)
        {
            if(_players[i].Score>21)
            {
                _players[i].Bet=0;
                _players[i].Win=false;
            }
            else if(_players[0].Score < 22)
            {
                _players[0].Win=true;
                if(_players[i].Score>_players[0].Score)
                {
                    _players[i].Win=true;
                    winners++;
                }
                else if(_players[i].Score==_players[0].Score)
                {
                    if(_players[i].Blackjack)
                    {
                        _players[i].Win=true;
                        if(_players[0].Blackjack)
                            _players[0].Win=true;
                        else
                        {
                            _players[0].Win=false; _players[i].Bet=(_players[i].Bet*2)+(_players[i].Bet/2);
                        }
                    }
                    else
                    {
                        _players[i].Win=true;
                        winners++;
                    }
                }
                else
                {
                    _players[i].Win=false;
                    _players[i].Bet=0;
                }
            }
            else
            {
                _players[i].Win=true;
                winners++;
            }
        }
        if(winners>0)
            _players[0].Win=false;

        //Win share
        for (int i = 0; i < _players.Count; i++)
        {
            SendToAll("player|"+SharePlayer(i));
            Console.WriteLine($"Name: {_players[i].Name}, Score: {_players[i].Score}, Bet: {_players[whosturn].Bet}, Win: "+_players[i].Win);
        }
        
        //finisce la partita
        GameReset();
        SendToAll("|newgame|");
    }
    public void GameReset()
    {
        game_started=false;
        for (int i = 0; i < _players.Count; i++)
        {
            for (int j = 0; j < _players[i].Ncards; j++)
                _players[i].Cards[j] = null;

            _players[i].Ncards = 0;
            _players[i].Win = null;
        }
        Console.WriteLine("\n-------------------");
    }
}