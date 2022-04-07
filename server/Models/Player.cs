using Newtonsoft.Json;
using WebSocketSharp;
using WebSocketSharp.Server;

class Player
{
    //Property
    public string Name { get; set; }
    public WebSocket Socket { get; set; }
    public int Ncards { get; set; }
    public Card[] Cards { get; set; } = new Card[10];
    private int _score;
    public int Score 
    { 
      get 
        { 
            int ace=0;
            _score=0;
            for(int i=0;i<Ncards;i++)
            {
                if(Cards[i].Value == "JACK" || Cards[i].Value == "QUEEN" || Cards[i].Value == "KING")
                {
                    _score += 10;
                }
                else if(Cards[i].Value == "ACE")
                {
                    ace+=1;
                }
                else
                _score += Convert.ToInt32(Cards[i].Value);

                Console.WriteLine($"carta {i+1}: "+Cards[i].Value);
            }
            while(ace>0)
            {
                if(_score+11>21)
                    _score+=1;
                else
                    _score+=11;
                ace--;
            }

            return _score; 
        }
      set { _score = 0; }
    }


    //Class card
    public class Card 
    {
        public string Code { get; set; }
        public Uri Image { get; set; }
        public string Value { get; set; }
    }

    //Constructor
    public Player(WebSocket _socket)
    {   
        Socket = _socket;
    }

    //Methods
    public void Initialize(string _name, int _ncards)
    {
        Name = _name;
        Ncards= _ncards;
    }

    public void AddCard(string _c, Uri _i, string _v)
    {
        Cards[Ncards] = new();
        Cards[Ncards].Code = _c;
        Cards[Ncards].Image = _i;
        Cards[Ncards].Value = _v;
        Ncards++;
    }
}
