document.getElementsByClassName('card')[0].style.display = "none";
const ws = new WebSocket("ws://127.0.0.1:9000/Board");   //server da contattare
var idClient=0;
var nickname="";

ws.addEventListener("open", () =>{  //evento di connessione
    Start()
});

ws.addEventListener("message", e =>{  //evento di ricezione messaggio
    console.log(e.data);
    if(e.data=="|start|")
        setUpBoard();
    else if(e.data.includes("players|"))
    {
        var words = e.data.split('|');
        var playersready = words[1]+"/"+words[2];
        document.getElementById("waitingplayer").innerHTML=playersready;
    }
    else if(e.data.includes("dealercards|"))
    {
        var words = e.data.split('|');
        giveCards(words[1], 0);
    }
    else if(e.data.includes("dealerscore|"))
    {
        var words = e.data.split('|');
        giveScore(words[1], 0);
    }
    else if(e.data.includes("jsonstartcards|"))
    {
        var words = e.data.split('|');
        giveCards(words[1], 1);
    }
    else if(e.data.includes("jsonrequestedcard|"))
    {
        var words = e.data.split('|');
        giveCards(words[1], 1);
    }
    else if(e.data.includes("score|"))
    {
        var words = e.data.split('|');
        giveScore(words[1], 1);
    }

});

//clona il nickname
document.getElementById("nick").addEventListener('keyup', () => {
    document.getElementById("cloneNick").value = document.getElementById("nick").value;
})
//passi una stringa mette la prima lettera MAIUSCOLA
function capitalize(str) {
    const lower = str.toLowerCase();
    return str.charAt(0).toUpperCase() + lower.slice(1);
}
    
function send(str){   //Invio messaggio al server
    ws.send(str);
}

function Start()
{
    document.getElementsByClassName('card')[0].style.display = "";
    ClientSeed();
}
//Randomize seed
var seed="";
function ClientSeed() {
    var suit = document.getElementsByClassName("suit");
    if((Math.floor(Math.random() * 11)%2)==0)
        seed="♠";//♥♦♣♠
    else
        seed="♣";//♥♦♣♠

    for(var i = 0; i < suit.length; i++)
    {
        suit[i].innerHTML = seed;
    }
}

function checkNickname()
{
    if(document.getElementById("nick").value == "")
    {
        //document.body.style.background = "#eb2225";

        var nick = document.getElementsByClassName("nickname");

        for(var i = 0; i < nick.length; i++)
        {
            nick[i].style.color = "#eb2225";
        }

        var suit = document.getElementsByClassName("suit");

        if((Math.floor(Math.random() * 11)%2)==0)
            seed="♦";//♥♦♣♠
        else
            seed="♥";//♥♦♣♠

        for(var i = 0; i < suit.length; i++)
        {
            suit[i].innerHTML = seed;
            suit[i].style.color = "#eb2225";
        }
    }
    else
    {
        document.getElementsByClassName('card')[0].style.display="none";
        nickname = document.getElementById("nick").value;
        nickname = capitalize(nickname);
        send(nickname+'|ready|');
        waitPlayers();
    }
}

function waitPlayers() {
    document.getElementsByClassName('table')[0].innerHTML = '<div class="wait"><span class="waiting">waiting for players who put it ready</span><span id="waitingplayer">x/n</span></div>';
}

function setUpBoard() {
    document.body.style.background = "#35654d";
    document.getElementsByClassName('table')[0].innerHTML='<div class="dealer"><div class="hand"></div><div class="score"></div></div><div class="player"><div class="hand"></div><div class="score"></div></div>';
}

function giveCards(json, who) {
    jsonObj = JSON.parse(json);
    var img="";
    for (let i = 0; i < jsonObj.cards.length; i++) {
        img += "<img src='"+jsonObj.cards[i].image+"'>";
    }
    //who can be: 0 = dealer, 1 = player
    document.getElementsByClassName('hand')[who].innerHTML=img;
}
function giveScore(txt, who) {
    //who can be: 0 = dealer, 1 = player
    document.getElementsByClassName('score')[who].innerHTML=txt;
}

