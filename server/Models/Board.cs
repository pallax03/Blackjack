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
    private static List<Player> _players = new List<Player>();//Players list, with this class i have the full control of the game (name, chat history, score and socket).
    private static NewDeck _jsonNewDeck = new NewDeck();//Deck Obj
    private static DrawCard _jsonDrawCard = new DrawCard();//Drawed Card Obj

    protected override void OnOpen()
    {
        WebSocket clientN = Context.WebSocket;
        Console.WriteLine("Richiesta connessione da client: " + (_clientSockets.Count + 1 ).ToString());
        //it only accepts a maximum of 7 clients
        if (_clientSockets.Count > 8)
        {
            Console.WriteLine("Chiusa connessione con client: " + (_clientSockets.Count + 1).ToString());
            Context.WebSocket.Close();
        }
        else {
            _clientSockets.Add(clientN);
            _clientready.Add(false);
            _players.Add(new Player(Context.WebSocket));
        }
    }
    protected override void OnMessage(MessageEventArgs e)//here, I handle all messages
    {
        //in order of the initial actions of the game
        if(e.Data.Contains("|ready|"))//the client put his state on ready
        {
            int nready=0;//count how many players they have set up --initialization
            string[] splitted = e.Data.Split("|");
            Console.WriteLine(e.Data+" nome: "+splitted[0]);
            _players[FindPlayer(Context.WebSocket)].Initialize(splitted[0], 0);//add other information of the player (name, number of cards in his hand)

            for (int i = 0; i < _clientSockets.Count; i++)//search the correct client socket index
            {
                if(Context.WebSocket==_clientSockets[i])//set the client ready in the parrarel bool list
                    _clientready[i]=true;

                if(_clientready[i]==true)//count how many players they have set up --storage
                    nready++;
            }

            SendToAll($"players|{nready}|{_clientready.Count}");//Send to all client the state of ready players
            ControlReadyState();//Control if all the players set ready
        }
        else if(e.Data == "|bet|")//the client bet
        {

        }
        else if(e.Data == "|card|")//the client request a card
        {
            GiveCard(Context.WebSocket);
        }
        else if(e.Data == "|hit|")//the client ...
        {

        }
        else if(e.Data == "|doubledown|")//the client doubledown
        {
            
        }

    }
    public void SendToAll(string message)//Send a message to all the clients
    {
        foreach (var socket in _clientSockets)
        {
            socket.Send(message);
        }
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
        //call deck API
        for (int i = 0; i < _clientSockets.Count; i++)
        {
            _clientSockets[i].Send("|start|");
        }
        var url = new Uri("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
        using (var client = new HttpClient())//api that set up the deck
        {
            //I want to contact with a GET
            var getResult = client.GetAsync(url).Result;
            var getResultJson = getResult.Content.ReadAsStringAsync().Result;
            _jsonNewDeck = JsonConvert.DeserializeObject<NewDeck>(getResultJson);//storage the Deck Obj
            //useful to know the deck_id to manage the deck with other calls to the api
        }
        GiveCards();//gives the two starting cards to each player
        Console.WriteLine(_jsonNewDeck.deck_id); //Debug
    }
    public void GiveCards()
    {
        //call card API
        var url = new Uri($"https://deckofcardsapi.com/api/deck/{_jsonNewDeck.deck_id}/draw/?count=2");
        for (int i = 0; i < _clientSockets.Count; i++)
        {
            using (var client = new HttpClient())//api that request 2 cards
            {
            //I want to contact with a GET
            var getResult = client.GetAsync(url).Result;
            var getResultJson = getResult.Content.ReadAsStringAsync().Result;
            _jsonDrawCard = JsonConvert.DeserializeObject<DrawCard>(getResultJson);//storage the Drawed Card Obj
            _clientSockets[i].Send("jsonstartcards|"+getResultJson);//Send to the client the json, he need that for visualize the cards (value and image).
            
            for (int j = 0; j < _jsonDrawCard.Cards.Length; j++)//adds as many cards as the json sends him
                _players[i].AddCard(_jsonDrawCard.Cards[j].Code,_jsonDrawCard.Cards[j].Image,_jsonDrawCard.Cards[j].Value);
            
            Console.WriteLine($"Name: {_players[i].Name}, Score: "+_players[i].Score);
            }
        }
    }

    public void GiveCard(WebSocket socket)
    {
        int playerfound_index = FindPlayer(socket);
        //call card API
        var url = new Uri($"https://deckofcardsapi.com/api/deck/{_jsonNewDeck.deck_id}/draw/?count=1");
        using (var client = new HttpClient())//api that request a card
        {
        //I want to contact with a GET
        var getResult = client.GetAsync(url).Result;
        var getResultJson = getResult.Content.ReadAsStringAsync().Result;
        _jsonDrawCard = JsonConvert.DeserializeObject<DrawCard>(getResultJson);//storage the Drawed Card Obj
        socket.Send("jsonrequestedcard|"+getResultJson);//Send to the client the json, he need that for visualize the cards (value and image).
        _players[playerfound_index].AddCard(_jsonDrawCard.Cards[0].Code,_jsonDrawCard.Cards[0].Image,_jsonDrawCard.Cards[0].Value);//adds as many cards as the json sends him
        
        Console.WriteLine($"Name: {_players[playerfound_index].Name}, Score: "+_players[playerfound_index].Score);
        }
    }

    public int FindPlayer(WebSocket socket)//search for a player given the socket
    {
        int result=0;
        for (int i = 0; i < _players.Count; i++)
        {
            if(_players[i].Socket==socket)
                result=i;
        }
        return result;
    }
}