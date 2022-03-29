using WebSocketSharp;
using WebSocketSharp.Server;

WebSocketServer wssv = new WebSocketServer("ws://127.0.0.1:9000");

wssv.AddWebSocketService<Board>("/Board");
wssv.AddWebSocketService<Chat>("/Chat");

wssv.Start();
Console.WriteLine("Server started on ws://127.0.0.1:9000/Board");
Console.WriteLine("Server started on ws://127.0.0.1:9000/Chat");

//interrompo il server dopo la pressione di un tasto
Console.ReadKey();
wssv.Stop();