using Newtonsoft.Json;
using WebSocketSharp;
using WebSocketSharp.Server;

#nullable disable

public class Board : WebSocketBehavior
{
    //Lista di client connessi
    private static List<WebSocket> _clientSockets = new List<WebSocket>();
    private static List<bool> _clientready = new List<bool>();
    //numero di client connessi
    private static int count;

    //Variabili di gioco
    private static List<Player> _players = new List<Player>();
    private static NewDeck _jsonNewDeck = new NewDeck();//mazzo
    private static DrawCard _jsonDrawCard = new DrawCard();//carta pescata

    protected override void OnOpen()
    {
        WebSocket clientN = Context.WebSocket;
        count = _clientSockets.Count;
        Console.WriteLine("Richiesta connessione da client: " + (count + 1 ).ToString());
        //accetto solo 7 client
        if (count > 8)
        {
            Console.WriteLine("Chiusa connessione con client: " + (count + 1).ToString());
            Context.WebSocket.Close();
        }
        else {
            _clientSockets.Add(clientN);
            _clientready.Add(false);
        }
    }
    protected override void OnMessage(MessageEventArgs e)
    {
        //gestisco tutti i messaggi

        //attesa di stato pronto
        if(e.Data.Contains("|ready|"))
        {
            int nready=0;
            string[] splitted = e.Data.Split("|");
            _players.Add(new Player(splitted[0],Context.WebSocket , 0));
            for (int i = 0; i < _clientSockets.Count; i++)
            {
                if(Context.WebSocket==_clientSockets[i])
                    _clientready[i]=true;

                if(_clientready[i]==true)
                    nready++;
            }

            Context.WebSocket.Send($"players|{nready}|{_clientready.Count}");
            ControllaStatoPronto();
        }

        if(e.Data == "Carte")
        {

        }
        
        if(e.Data == "Carta")
        {
            
        }

    }

    public void ControllaStatoPronto()
    {
        bool Inizia=true;
        for (int i = 0; i < _clientready.Count && Inizia==true; i++)
        {
            if (_clientready[i]==false)
            {
                Inizia=false;
            }
        }
        if(Inizia)
            StartGame();
    }

    public void StartGame()
    {
        //call deck API
        for (int i = 0; i < _clientSockets.Count; i++)
        {
            _clientSockets[i].Send("|start|");
        }
        var url = new Uri("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
        using (var client = new HttpClient())//api che mescola il mazzo
        {
            //voglio cotattare con una GET
            var getResult = client.GetAsync(url).Result;
            var getResultJson = getResult.Content.ReadAsStringAsync().Result;
            _jsonNewDeck = JsonConvert.DeserializeObject<NewDeck>(getResultJson);//json deck istanziato
            //bisogno di id del deck per gestire il gioco
        }
        GiveCards();
        Console.WriteLine(_jsonNewDeck.deck_id);
    }
    public void GiveCards()
    {
        //call card API
        var url = new Uri($"https://deckofcardsapi.com/api/deck/{_jsonNewDeck.deck_id}/draw/?count=2");
        for (int i = 0; i < _clientSockets.Count; i++)
        {
            
            using (var client = new HttpClient())//api che richiede 2 carte
            {
            //voglio cotattare con una GET
            var getResult = client.GetAsync(url).Result;
            var getResultJson = getResult.Content.ReadAsStringAsync().Result;
            _jsonDrawCard = JsonConvert.DeserializeObject<DrawCard>(getResultJson);//json carte date
            _clientSockets[i].Send("jsonstartcards|"+getResultJson);//manda direttamente il json delle carte
                // for (int j = 0; j < _jsonDrawCard.Cards.Length; j++)
                // {
                //     _players[i].Cards[_players[i].Ncards].Code = _jsonDrawCard.Cards[j].Code;
                //     _players[i].Cards[_players[i].Ncards].Image = _jsonDrawCard.Cards[j].Image;
                //     _players[i].Cards[_players[i].Ncards].Value = _jsonDrawCard.Cards[j].Value;
                //     _players[i].Ncards++;
                // }
            }
        }
    }
}