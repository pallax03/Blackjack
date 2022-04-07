using WebSocketSharp;
using WebSocketSharp.Server;

public class Chat : WebSocketBehavior
{
    //list of websocket ~ 1 websocket = 1 client
    private static List<WebSocket> _clientSockets = new List<WebSocket>();
    
    //number of client connected
    private static int count;

    protected override void OnOpen()
    {
        WebSocket clientN = Context.WebSocket;
        count = _clientSockets.Count;
        Console.WriteLine("Richiesta connessione da client: " + (count + 1 ).ToString());
        //it only accepts a maximum of 7 clients
        if (count > 8)
        {
            Console.WriteLine("Chiusa connessione con client: " + (count + 1).ToString());
            Context.WebSocket.Close();
        }
        else {
            _clientSockets.Add(clientN);
            clientN.Send($"idclient|{_clientSockets.Count}");
        }
    }
    protected override void OnMessage(MessageEventArgs e)
    {
        //invio ad un client i messaggi dell'altro
        Console.WriteLine("Received message from client: " + e.Data);
        for (int i = 0; i < _clientSockets.Count; i++)
        {
            _clientSockets[i].Send(e.Data);
        }
    }
}