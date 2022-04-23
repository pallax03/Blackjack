//start function
document.getElementsByClassName('card')[0].style.display = 'none';
document.getElementsByClassName('waiting')[0].style.display = 'none';
document.getElementsByClassName('board')[0].style.display = 'none';
document.getElementsByClassName('chat')[0].style.display = 'none';

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
        setCommands();
    }
    else if(e.data=="|stop|"){
        document.getElementsByClassName('commands')[0].innerHTML='';
    }
    else if(e.data=="|newgame|"){
        document.getElementsByClassName('card')[0].style.display = '';
        if(nickname!="")
        {
            document.getElementsByClassName('card')[0].style.opacity = '0.5';
            document.getElementById('nick').setAttribute("readonly", true);
        } 
    }
});

//clona il nickname
document.getElementById("nick").addEventListener('keyup', () => {
    document.getElementById("cloneNick").value = document.getElementById("nick").value;
})
//avvia il gioco se viene cliccato invio.
document.getElementById('nick').addEventListener('keydown', function (e) {
	if (e.code == 'Enter') startGame();
});
//capitalizza una stringa.
function capitalize(str) {
    const lower = str.toLowerCase();
    return str.charAt(0).toUpperCase() + lower.slice(1);
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

function checkNickname() {
	var str = document.getElementById('nick').value;

	if (str == null || str.match(/^ *$/) != null) {
		document.body.style.background = 'red';

		var userInput = document.getElementsByClassName('nickname');

		for (var i = 0; i < userInput.length; i++) {
			userInput[i].value = '';
			userInput[i].style.color = 'red';
		}

		var suit = document.getElementsByClassName('suit');
        if((Math.floor(Math.random() * 11)%2)==0)
            seed="♥";//♥♦♣♠
        else
            seed="♦";//♥♦♣♠

		for (var i = 0; i < suit.length; i++) {
			suit[i].style.color = 'red';
			suit[i].innerHTML = seed;
		}
		return true;
	}
}

function startGame() {
	if (!checkNickname()) {
		document.body.style.background = '';
		document.getElementsByClassName('card')[0].style.display = 'none';
		nickname = document.getElementById('nick').value;
		send(capitalize(nickname) + '|ready|' + bet);
		waitPlayers();
		startChat();
	}
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
	document.getElementsByClassName('board')[0].innerHTML += html;
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
    if(jsonObj.Name==nickname)
        jsonObj.Name = "You";
    document.getElementsByClassName('score')[jsonObj.Id].innerHTML=jsonObj.Name+": "+ jsonObj.Score;
}

//chat
const wschat = new WebSocket("ws://127.0.0.1:9000/Chat");   //server da contattare per giocare

wschat.addEventListener("open", () =>{ });

function startChat() {
	document.getElementsByClassName('chat')[0].style.display = '';
	document.getElementById('msg').focus();
}

wschat.addEventListener("message", e =>{  //evento di ricezione messaggio chat
	console.log(e.data);
	words = e.data.split('|');
	if (words[0] == idClient) words[2] = 'You';
	document.getElementById('history').innerHTML += words[2] + ': ' + words[1] + '<br>';
});

// invia il messaggio se viene cliccato invio.
document.getElementById('msg').addEventListener('keydown', function (e) {
	if (e.code == 'Enter') chat();
	document.getElementById('msg').focus();
});

// Invio il messaggio al server.
function chat() {
	wschat.send(document.getElementById('msg').value);
	document.getElementById('msg').value = '';
	document.getElementById('msg').focus();
}
//------------------