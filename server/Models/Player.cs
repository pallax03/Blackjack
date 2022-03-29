using Newtonsoft.Json;
using WebSocketSharp;
using WebSocketSharp.Server;

class Player
{
    public string Name { get; set; }
    public WebSocket Socket { get; set; }
    public int Ncards { get; set; }
    public Card[] Cards { get; set; }
    public int Score 
    { 
      get { return Score; }
      set 
      {             
        int ace=0;
        value = 0 ;
        foreach (var a in Cards)
        {
            if(a.Value == "JACK" || a.Value == "QUEEN" || a.Value == "KING")
            {
                value += 10;
            }
            else if(a.Value == "ACE")
            {
                ace+=1;
            }
            else
            value += Convert.ToInt32(a.Value);
        }
        while(ace>0)
        {
            if((value+11)-23>(value+1)-23)
                value+=1;
            else
                value+=11;
            ace--;
        }
        Score = value;
      }
     }

    public partial class Card
    {
        public string Code { get; set; }
        public Uri Image { get; set; }
        public string Value { get; set; }
    }

    public Player(string _name, WebSocket _socket, int _ncards)
    {
        Name = _name;
        Socket = _socket;
        Ncards= _ncards;
    }
}
