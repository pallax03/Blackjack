//start function
document.getElementsByClassName('card')[0].style.display = 'none';
document.getElementsByClassName('waiting')[0].style.display = 'none';
document.getElementsByClassName('board')[0].style.display = 'none';//contains chat and liveboard
document.getElementsByClassName('btncard')[0].style.display='none';
document.getElementsByClassName('btnstop')[0].style.display='none';
document.getElementsByClassName('newgame')[0].style.display='none';
document.getElementsByClassName('balance')[0].style.display='none';
document.getElementsByClassName('msgreward')[0].style.display = 'none';
document.getElementById("nick").style.webkitAnimationPlayState = "paused";
document.getElementById("cloneNick").style.webkitAnimationPlayState = "paused";
document.getElementById("startbet").style.webkitAnimationPlayState = "paused";

//  game
const wsboard = new WebSocket("ws://127.0.0.1:9000/Board");   //server da contattare per giocare
var idClient=0;
var totalplayers=0;
var nickname="";
var bet="0";
var words = "";//words[1]: json

wsboard.addEventListener("open", () =>{  //evento di connessione
    document.getElementsByClassName('card')[0].style.display = '';
    document.getElementsByClassName('balance')[0].style.display='';
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
        commands();
    }
    else if(e.data=="|stop|"){
        hideCommands();
    }
    else if(e.data=="|newgame|"){
        hideCommands();
        document.getElementsByClassName('newgame')[0].style.display = '';
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

    for(var i = 0; i < suit.length; i++){
        suit[i].style.color = 'black';
        suit[i].innerHTML = seed;
    }
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
	if (isNaN(money) || money > parseFloat(document.getElementById('balance').innerHTML))
    { document.getElementById("startbet").style.webkitAnimationPlayState = "running"; setTimeout(function() {document.getElementById("startbet").style.webkitAnimationPlayState = "paused";}, 2000);
     redSeed(); return true;}
}
function checkNickname() {
	var str = document.getElementById('nick').value;
	if (str == null || str.match(/^ *$/) != null) {
        document.getElementById("nick").style.webkitAnimationPlayState = "running"; setTimeout(function() {document.getElementById("nick").style.webkitAnimationPlayState = "paused";}, 2000);
        document.getElementById("cloneNick").style.webkitAnimationPlayState = "running"; setTimeout(function() {document.getElementById("cloneNick").style.webkitAnimationPlayState = "paused";}, 2000);
        redSeed();return true;}
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

function commands() {
    document.getElementsByClassName('btncard')[0].style.display='';
    document.getElementsByClassName('btnstop')[0].style.display='';
}function hideCommands() {
    document.getElementsByClassName('btncard')[0].style.display='none';
    document.getElementsByClassName('btnstop')[0].style.display='none'; 
}

function setNewGame() {
    document.getElementsByClassName('card')[0].style.display = '';
    document.getElementsByClassName('liveboard')[0].style.display = 'none';
    document.getElementById("btnrestart").onclick= viewBoard;
    document.getElementById("btnrestart").innerHTML = "<h1>View Board</h1>";
}
function viewBoard() {
    document.getElementsByClassName('card')[0].style.display = 'none';
    document.getElementsByClassName('liveboard')[0].style.display = '';
    document.getElementById("btnrestart").onclick= setNewGame;
    document.getElementById("btnrestart").innerHTML = "<h1>New Game</h1>";
}

function waitPlayers() {
    //Initialaze the card
    document.getElementById('nick').setAttribute("readonly", true);
    document.getElementById("startbet").value='';
    clientSeed();
    document.getElementById("btnrestart").onclick= setNewGame;
    document.getElementById("btnrestart").innerHTML = "<h1>New Game</h1>";
    document.getElementsByClassName('newgame')[0].style.display='none';
    document.getElementsByClassName('waiting')[0].style.display = '';
}

function setUpBoard() {
    document.getElementsByClassName('waiting')[0].style.display = 'none';
	document.getElementsByClassName('board')[0].style.display = '';
    document.getElementsByClassName('liveboard')[0].style.display = '';

	var html = "<div class='dealer'><div class='score'></div><div class='hand'></div><div class='reward'></div></div>";
    html+='<div class="container">';
	for (var i = 0; i < totalplayers; i++) {
		// prettier-ignore
		html += "<div class='player'><div class='reward'></div><div class='score'></div><div class='hand'></div></div>";
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
    if(jsonObj.Id==idClient)
        jsonObj.Name = "You";
    document.getElementsByClassName('score')[jsonObj.Id].innerHTML=jsonObj.Name+": "+ jsonObj.Score;
    
    if(jsonObj.Win==true){
        document.getElementsByClassName('reward')[jsonObj.Id].innerHTML="✅";
        if(jsonObj.Id==idClient)
        {
            if(parseFloat(jsonObj.Bet)==bet)
                rewardMsg("Draw");
            else
                rewardMsg("Win"); 

            document.getElementById('balance').innerHTML = parseFloat(document.getElementById('balance').innerHTML)+ parseFloat(jsonObj.Bet);
        }
    }else if (jsonObj.Win==false){
        document.getElementsByClassName('reward')[jsonObj.Id].innerHTML="❌";
        if(jsonObj.Id==idClient) rewardMsg("Lose");
    }
}

function rewardMsg(str) {
    document.getElementsByClassName('msgreward')[0].style.display = '';
    document.getElementsByClassName('msgreward')[0].innerHTML="You "+ str +" "+ bet + " €";
    setTimeout(hideRewardMsg, 10000);
}

function hideRewardMsg() {
    document.getElementsByClassName('msgreward')[0].style.display = 'none';
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