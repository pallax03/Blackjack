using Newtonsoft.Json;
using WebSocketSharp;
using WebSocketSharp.Server;

public class Player
{
    //Property
    public string Id { get; set; }
    public string Name { get; set; }
    public WebSocket Socket { get; set; }
    public double Bet { get; set; }
    public int Ncards { get; set; }
    public Card[] Cards { get; set; } = new Card[10];
    private bool _blackjack;
    public bool Blackjack 
    { 
      get 
        { 
            _blackjack=false;
            if(Ncards==2 && Score==21)
                _blackjack=true;

            return _blackjack; 
        }
      set { _blackjack = false; }
    }
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
                    _score+=11;
                    ace+=1;
                }
                else
                _score += Convert.ToInt32(Cards[i].Value);
            }
            while(ace>0)
            {
                if(_score>21)
                    _score-=10;
                ace--;
            }

            return _score; 
        }
      set { _score = 0; }
    }
    public bool? Win { get; set; } = null;


    //Class card
    public class Card 
    {
        public string Code { get; set; }
        public Uri Image { get; set; }
        public string Value { get; set; }

        public Card (string _c, Uri _i, string _v)
        {
            Code = _c;
            Image = _i;
            Value = _v;
        }
    }

    //Constructor Dealer
    public Player(string _id, string _name, int _ncards)
    {   
        Id = _id;
        Name = _name;
        Ncards= _ncards;
    }
    //Constructor Player
    public Player(string _id,WebSocket _socket)
    {   
        Id = _id;
        Socket = _socket;
    }

    //Methods
    public void Initialize( string _name, int _ncards, double _bet)
    {
        Name = _name;
        Ncards= _ncards;
        Bet = _bet;
    }

    public void AddCard(string _c, Uri _i, string _v)
    {
        Cards[Ncards] = new(_c, _i, _v);
        Ncards++;
    }
}