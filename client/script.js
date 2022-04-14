document.getElementsByClassName('card')[0].style.display = "none";
const ws = new WebSocket("ws://127.0.0.1:9000/Board");   //server da contattare
var idClient=0;
var totalplayers=0;
var nickname="";
var words = "";//words[1]: json

ws.addEventListener("open", () =>{  //evento di connessione
    Start()
});

ws.addEventListener("message", e =>{  //evento di ricezione messaggio
    console.log(e.data);
    if(e.data=="|start|")
        setUpBoard();
    else if(e.data.includes("numberofplayers|"))
    {
        words = e.data.split('|');totalplayers=words[2];
        var playersready = words[1]+"/"+words[2];// in only this case words[1]: n players, words[2]: total players
        document.getElementById("waitingplayer").innerHTML=playersready;
    }
    else if(e.data.includes("player|"))
    {
        words = e.data.split('|');
        givePlayer(words[1]);
    }
    else if(e.data.includes("|yourturn|"))
    {
        setCommands();
    }
    else if(e.data.includes("|stop|"))
    {
        document.getElementsByClassName('commands')[0].innerHTML='';
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
    var table = '<div class="dealer"><div class="hand"></div><div class="score"></div></div>';//dealer
    for (let index = 0; index<totalplayers; index++)
        table+='<div class="player"><div class="hand"></div><div class="score"></div></div>';

    document.getElementsByClassName('table')[0].innerHTML=table;
}

function setCommands() {
    document.getElementsByClassName('commands')[0].innerHTML='<div class="???"><input type="button" value="Request Card" id="btnCard" onclick=send(\'|card|\')></div><div class="???"><input type="button" value="Stop" id="btnStop" onclick=send(\'|stop|\')></div>';
}

function givePlayer(json)
{
    jsonObj = JSON.parse(json);
    var img="";
    for (let i = 0; i < jsonObj.Ncards; i++) {
        img += "<img src='"+jsonObj.Cards[i].Image+"'>";
    }
    document.getElementsByClassName('hand')[jsonObj.Id].innerHTML=img;
    document.getElementsByClassName('score')[jsonObj.Id].innerHTML=jsonObj.Score;
}