using WebSocketSharp;
using WebSocketSharp.Server;

public class Chat : WebSocketBehavior
{
    //list of websocket ~ 1 websocket = 1 client
    private static List<WebSocket> _clientSockets = new List<WebSocket>();
    protected override void OnOpen()
    {
        //it only accepts a maximum of 7 clients
        if (_clientSockets.Count > 6)
        {
            Console.WriteLine("Chiusa connessione con client: " + (_clientSockets.Count + 1).ToString()+ "(chat)");
            Context.WebSocket.Close();
        }
        else 
        {
            _clientSockets.Add(Context.WebSocket);
        }
    }
    protected override void OnMessage(MessageEventArgs e)
    {
        int id = FindSocket(Context.WebSocket);
        SendToAll(id+"|"+e.Data+"|"+Board._players[id].Name);
    }
    public int FindSocket(WebSocket socket)
    {
        for (int i = 0; i < _clientSockets.Count; i++)
        {
            if(_clientSockets[i]==socket)
                return i+1;
        }
        return 0;
    }
    public void SendToAll(string message)
    {
        foreach (var socket in _clientSockets)
        {
            socket.Send(message);
        }
    }
}