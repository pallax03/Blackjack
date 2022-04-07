const ws = new WebSocket("ws://127.0.0.1:9000/Board");   //server da contattare
var idclient=0;

ws.addEventListener("open", () =>{  //evento di connessione
    console.log("we are connected!");
    setUpStart();
});

ws.addEventListener("message", e =>{  //evento di ricezione messaggio
    console.log(e.data);
    if(e.data=="|start|")
        setUpBoard();
    else if(e.data.includes("players|"))
    {
        var words = e.data.split('|');
        var playersready = words[1]+"/"+words[2];
        document.getElementById("waitingnplayer").innerHTML=playersready;
    }
    else if(e.data.includes("jsonstartcards|"))
    {
        var words = e.data.split('|');
        giveCard(words[1]);
    }
    else if(e.data.includes("jsonrequestedcard|"))
    {
        var words = e.data.split('|');
        giveCard(words[1]);
    }
});

function send(str){   //Invio messaggio al server
    ws.send(str);
}


function setUpStart() {
    var div="<div id='start' class='start'>";
    div+="<input type='text' name='name' id='playername'>";
    div+="<button id='ready' onclick='playerReady()'>Are you ready?</button>";
    div+="</div>";
    document.getElementById("table").innerHTML=div;
}

function playerReady()
{
    if(document.getElementById("playername").value=="")
        document.getElementById("playername").className="error";
    else
    {
        console.log(document.getElementById("playername").value);
        send(document.getElementById("playername").value+'|ready|');
        waitPlayers();
    }
}

function waitPlayers() {
    var div="<div id='waiting'>";
    div+="<span class='waiting'>waiting for players who put it ready</span>";
    div+="</br><span id='waitingnplayer'></span>";
    div+="</div>";

    document.getElementById("table").innerHTML=div;
}

function setUpBoard() {
    document.body.style = "background-color:green;";
    var div="<div id='information'>";
    div+="<button id='ready' onclick=send(\'|card|\')>request card</button>";
    div+="</div>";
    div+="<div id='hand'>";
    div+="";
    div+="</div>";
    document.getElementById("table").innerHTML=div;
}

function giveCard(json) {
    jsonObj = JSON.parse(json);
    var img="";
    for (let i = 0; i < jsonObj.cards.length; i++) {
        img += "<img src='"+jsonObj.cards[i].image+"'>";
    }
    document.getElementById("hand").innerHTML+=img;
}