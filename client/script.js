//start function
document.getElementsByClassName('card')[0].style.display = 'none';
document.getElementsByClassName('waiting')[0].style.display = 'none';
document.getElementsByClassName('board')[0].style.display = 'none';//contains chat and liveboard
document.getElementsByClassName('commands')[0].style.display='none';

//  game
const wsboard = new WebSocket("ws://127.0.0.1:9000/Board");   //server da contattare per giocare
var idClient=0;
var totalplayers=0;
var nickname="";
var bet="0";
var words = "";//words[1]: json

wsboard.addEventListener("open", () =>{  //evento di connessione
    document.getElementsByClassName('card')[0].style.display = "";
    clientSeed();
	document.getElementById('nick').focus();
});

wsboard.addEventListener("message", e =>{  //evento di ricezione messaggio
    console.log(e.data);words = e.data.split('|');
    if(e.data.includes("idClient|")){
        idClient=words[1];
    } 
    else if(e.data=="|start|"){
        setUpBoard();
    }
    else if(e.data.includes("numberofplayers|")){
        totalplayers=words[2];
        document.getElementById("counter").innerHTML=words[1]+"/"+words[2]; // in only this case words[1]: n players, words[2]: total players
    }
    else if(e.data.includes("player|")){
        givePlayer(words[1]);
    }
    else if(e.data.includes("whoactive|")){
        giveStatus(words[1]);
    }
    else if(e.data=="|yourturn|"){
        document.getElementsByClassName('commands')[0].style.display='';
    }
    else if(e.data=="|stop|"){
        document.getElementsByClassName('commands')[0].style.display='none';
    }
    else if(e.data=="|newgame|"){
        //document.getElementsByClassName('commands')[0].innerHTML='<div class="???"><input type="button" value="Request Card" id="btnCard" onclick=send(\'|card|\')></div><div class="???"><input type="button" value="Stop" id="btnStop" onclick=send(\'|stop|\')></div>';
    }
});

//clona il nickname
document.getElementById("nick").addEventListener('keyup', () => {
    document.getElementById("cloneNick").value = document.getElementById("nick").value;
})

//avvia il gioco se viene cliccato invio.
document.getElementById('startbet').addEventListener('keydown', function (e) {
	if (e.code == 'Enter') startGame();
});
document.getElementById('nick').addEventListener('keydown', function (e) {
	if (e.code == 'Enter') startGame();
});

//capitalizza le parole(ex. alex mazzoni --> Alex Mazzoni).
function capitalize(str) {
    const lower = str.toLowerCase();
    var ris="";
    var names = lower.split(' ');
    for (let index = 0; index < names.length; index++) {
        ris += names[index].charAt(0).toUpperCase() + names[index].slice(1);
        if(index+1 < names.length) ris+= ' ';
    }
    return ris;
}

//Invio messaggio al server
function send(str){   
    wsboard.send(str);
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
        suit[i].innerHTML = seed;
}
function redSeed() {
    var suit = document.getElementsByClassName('suit');
    if((Math.floor(Math.random() * 11)%2)==0)
        seed="♥";//♥♦♣♠
    else
        seed="♦";//♥♦♣♠

    for (var i = 0; i < suit.length; i++) {
        suit[i].style.color = 'red';
        suit[i].innerHTML = seed;
    }
    document.body.style.background = 'red';
}

function checkBet() {
    var money = parseFloat(document.getElementById('startbet').value);
	if (isNaN(money) || money > parseFloat(document.getElementById('balance').innerHTML)) {redSeed();return true;}
}
function checkNickname() {
	var str = document.getElementById('nick').value;
	if (str == null || str.match(/^ *$/) != null) {redSeed();return true;}
}
function startGame() {
    if (!checkNickname()) {
        if(!checkBet()) {
            document.body.style.background = '';
            document.getElementsByClassName('card')[0].style.display = 'none';
            nickname = capitalize(document.getElementById('nick').value);
            bet = document.getElementById('startbet').value;
            document.getElementById('balance').innerHTML = parseFloat(document.getElementById('balance').innerHTML)-bet;
            send(nickname + '|ready|' + bet);
            waitPlayers();
            startChat();
        }
    }
}
function restartGame() {
    document.getElementsByClassName('liveboard')[0].style.display = 'none';
    send(nickname + '|ready|' + bet);
    waitPlayers();
}

function waitPlayers() {
    document.getElementsByClassName('waiting')[0].style.display = '';
}

function setUpBoard() {
    document.getElementsByClassName('waiting')[0].style.display = 'none';
	document.getElementsByClassName('board')[0].style.display = '';

	var html = "<div class='dealer'><div class='score'></div><div class='hand'></div></div>";
    html+='<div class="container">';
	for (var i = 0; i < totalplayers; i++) {
		// prettier-ignore
		html += "<div class='player'><div class='score'></div><div class='hand'></div></div>";
	}
    html+='</div>';
	document.getElementsByClassName('liveboard')[0].innerHTML = html;
    //document.body.style.background = "#35654d";
}

function giveStatus(who) {
    resetStatus();
    //give status
    if(who==0)
        document.getElementsByClassName('dealer')[0].id = "active";
    else
        document.getElementsByClassName('player')[who-1].id = "active";
}

function resetStatus() {
    //Reset
    document.getElementsByClassName('dealer')[0].id = "";
    for (let index = 0; index < document.getElementsByClassName('player').length; index++)
        document.getElementsByClassName('player')[index].id = "";
}

function givePlayer(json)
{
    jsonObj = JSON.parse(json);
    var img="";
    for (let i = 0; i < jsonObj.Ncards; i++) {
        img += "<img src='"+jsonObj.Cards[i].Image+"'>";
    }
    document.getElementsByClassName('hand')[jsonObj.Id].innerHTML=img;
    if(jsonObj.Name==nickname)
        jsonObj.Name = "You";
    document.getElementsByClassName('score')[jsonObj.Id].innerHTML=jsonObj.Name+": "+ jsonObj.Score;
}

//chat
const wschat = new WebSocket("ws://127.0.0.1:9000/Chat");   //server da contattare per giocare
var whohistory="";

wschat.addEventListener("open", () =>{ });

function startChat() {
	document.getElementsByClassName('chat')[0].style.display = '';
	document.getElementById('msg').focus();
}

wschat.addEventListener("message", e =>{  //evento di ricezione messaggio chat
	console.log(e.data);
    var chat = document.getElementById('history');
	words = e.data.split('|');

	if (words[0] == idClient) words[2] = 'You';
    if(whohistory=="")//fa un indentazione carina nella chat 
        chat.innerHTML += words[2] + ': ' + words[1];
    else
    {
        if(whohistory==words[2]) 
            chat.innerHTML += '<br>' + words[2] + ': ' + words[1];
        else
            chat.innerHTML += '<br><br>' + words[2] + ': ' + words[1];
    }

    whohistory = words[2];
    chat.scrollTop = chat.scrollHeight;
});

// invia il messaggio se viene cliccato invio.
function press(e) {
    if (e.code == 'Enter') chat();
    document.getElementById('msg').focus();
}

// Invio il messaggio al server.
function chat() {
    var msg = document.getElementById('msg').value;
    if (msg!="") {
        wschat.send(msg);
        document.getElementById('msg').value = '';
        document.getElementById('msg').focus();
    }
}
//------------------