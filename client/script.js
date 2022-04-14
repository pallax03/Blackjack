//start function
document.getElementsByClassName('card')[0].style.display = "none";

//  game
const wsboard = new WebSocket("ws://127.0.0.1:9000/Board");   //server da contattare per giocare
var idClient=0;
var totalplayers=0;
var nickname="";
var bet="0";
var words = "";//words[1]: json

wsboard.addEventListener("open", () =>{  //evento di connessione
    start();
});

wsboard.addEventListener("message", e =>{  //evento di ricezione messaggio
    console.log(e.data);
    if(e.data.includes("idClient|"))
    {
        words = e.data.split('|');
        idClient=words[1];
    } 
    else if(e.data=="|start|")
    {
        setUpBoard();
    } 
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
    else if(e.data=="|yourturn|")
    {
        setCommands();
    }
    else if(e.data=="|stop|")
    {
        document.getElementsByClassName('commands')[0].innerHTML='';
    }
    else if(e.data=="|newgame|")
    {
        document.getElementsByClassName('card')[0].style.display = '';
        document.getElementsByClassName('card')[0].style.opacity = '0.5';
        document.getElementById('nick').setAttribute("readonly", true);
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
    wsboard.send(str);
}

function start()
{
    document.getElementsByClassName('card')[0].style.display = "";
    clientSeed();
}
//Randomize seed
var seed="";
function clientSeed() {
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
        send(nickname+'|ready|'+bet);
        waitPlayers();
        //  chat
        startChat();
        
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

//chat
const wschat = new WebSocket("ws://127.0.0.1:9000/Chat");   //server da contattare per giocare

wschat.addEventListener("open", () =>{  //evento di connessione chat
    
});

wschat.addEventListener("message", e =>{  //evento di ricezione messaggio chat
    console.log(e.data);
    words = e.data.split('|');
    if(words[0]==idClient)
        words[2] = "You";

    document.getElementById("LiveChat").innerHTML += words[2]+": "+words[1];
});

function chat(){   //Invio messaggio al server
    wschat.send(document.getElementById('text').value);
}

function startChat() {
    document.getElementsByClassName('chat')[0].innerHTML ='Text: <input type="text" id="text"><input type="button" value=">" id="btnChat" onclick=chat()><span style="background-color: lightgreen;flex: auto;"><p>Chat di gruppo: <div id="LiveChat"></div></p></span>';
}
//------------------