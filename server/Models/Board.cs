using WebSocketSharp;
using WebSocketSharp.Server;

public class Board : WebSocketBehavior
{
    //Lista di client connessi
    private static List<WebSocket> _clientSockets = new List<WebSocket>();
    private static List<bool> _clientready = new List<bool>();
    //numero di client connessi
    private static int count;

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
        //attesa di stato pronto
        Console.WriteLine("Received message from client: " + e.Data);
        if(e.Data == "ready")
        {
            for (int i = 0; i < _clientSockets.Count; i++)
            {
                if(Context.WebSocket==_clientSockets[i])
                    _clientready[i]=true;
            }
            ControllaStatoPronto();
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
            _clientSockets[i].Send("start");
        }
        var url = new Uri("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
        using (var client = new HttpClient())//api che mescola il mazzo
        {
            //voglio cotattare con una GET
            var getResult = client.GetAsync(url).Result;
            //metto la risposta dentro una string
            var getResultJson = getResult.Content.ReadAsStringAsync().Result;
            //converto la stringa in un JSON -> per farlo devo prima creare la classe personalizzata
            jsonObject = JsonConvert.DeserializeObject<API>(getResultJson);
        }
    }
}