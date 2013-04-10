// ==UserScript==
// @name        Dominion Online Live Log Viewer
// @namespace   http://dom.retrobox.eu
// @description Dominion Online Live Log Viewer
// @include     http://play.goko.com/Dominion/gameClient.html
// @include     https://play.goko.com/Dominion/gameClient.html
// @grant       none
// @version     4
// ==/UserScript==
var newLog = document.createElement('div');
var newLogText = '';
var newLogMode = -1;
var newLogPlayers = 0;
var newLogNames = {};
var newPhase = 'init';
var newPrevPhase = 'init';
newLog.setAttribute("class", "newlog");
document.getElementById("goko-game").appendChild(newLog);
Dom.DominionWindow.prototype._old_updateState = Dom.DominionWindow.prototype._updateState;
Dom.DominionWindow.prototype._updateState = function (opt) {
    if (opt.dominionPhase) newPhase = opt.dominionPhase;
    this._old_updateState(opt);
}

Dom.LogManager.prototype.old_addLog = Dom.LogManager.prototype.addLog;
Dom.LogManager.prototype.addLog = function (opt) {
    if (opt.logUrl) {
	opt.logUrl = 'http://dom.retrobox.eu/?'+opt.logUrl.substr(29);
    }
    if (opt.text) {
	var h = opt.text.match(/^-+ (.*) -+$/);
	if (h) {
	    var j = h[1].match(/^(.*): turn \d+$/);
	    if (j) {
		newLogMode = newLogNames[j[1]];
		newLogText += '<h1 class="p'+newLogMode+'">'+h[1]+'</h1>';
	    } else {
		if (h[1] == 'Game Setup') {
		    newLogText = '';
		    newLogMode = 0;
		    newLogPlayers = 0;
		    newLogNames = {};
		} else {
		    newLogMode = -1;
		}
		newLogText += '<h1>'+h[1]+'</h1>';
	    }
	} else {
	    if (newLogMode == 0) {
		var h = opt.text.match(/^(.*) - starting cards:/);
		if (h) newLogNames[h[1]] = ++newLogPlayers;
	    }
	    var h;
	    if (h = opt.text.match(/^(.*) -( ([a-z]*).*)$/)) {
		var indent = false;
		if (newLogMode > 0) {
		    var initial = newPhase.substr(0,1).toUpperCase();
		    indent = h[3] != 'plays' && h[3] != 'buys' && newPrevPhase == newPhase;
		    if (newPrevPhase == newPhase) initial = '&nbsp;';
		    newPrevPhase = newPhase;
		    newLogText += '<span class="phase '+newPhase+'Phase">'+initial+'</span> ';
		}
		newLogText += indent ? '<span class="indent">' : '<span>';
		if (newLogNames[h[1]] != newLogMode)
		    newLogText += '<span class="player p'+newLogNames[h[1]]+'">'+h[1]+'</span>';
		newLogText += colorize(h[2]) + '</span><br>';
	    } else if (newLogMode == 0 && (h = opt.text.match(/^(Supply cards:)(.*)/))) {
		newLogText += h[1] + colorize(h[2]) + '<br>';
	    } else {
		newLogText += opt.text + '<br>';
	    }
	}
	var goko_canvas = document.getElementById("myCanvas");
	goko_canvas.style.marginLeft="0px";
	document.getElementById("goko-game").setAttribute("style", 'margin-left:'+Math.floor(-window.innerWidth/2) + 'px !important');
	var goko_w = goko_canvas.offsetWidth;
	var goko_h = goko_canvas.offsetHeight;
	var w = window.innerWidth - goko_w - 10;
	var t = Math.floor((window.innerHeight - goko_h) / 2);
	newLog.setAttribute("style", "position:absolute; overflow:auto; left:"+goko_w+"px; width:"+w+"px; top:"+t+"px; height:"+goko_h+"px; background-color: white; z-index: -1");
	newLog.innerHTML = newLogText;
	newLog.scrollTop = newLog.scrollHeight;
    }
    this.old_addLog(opt);
};
//function newLogAlign() {
//    setTimeout('newLogAlign()', 1000/2);
//}
//newLogAlign();
function addStyle(style) {
var head = document.getElementsByTagName('head')[0];
var ele = head.appendChild(window.document.createElement('style'));
ele.innerHTML = style;
return ele;
}
{
var style = "\
div.newlog {\
font-size:12px;\
font-family:Helvetica, Arial;\
padding: 0px 5px;\
}\
table {\
margin: 5px 10px;\
padding: 0px 20px;\
}\
td {\
padding: 0px 1px;\
}\
td.c1 {\
text-align:right;\
width:200px;\
}\
h1 {\
margin: 0px 0px;\
padding: 0px 5px;\
font-size:14px;\
background-color: lightgray;\
border: 2px solid gray; \
border-radius: 5px;\
}\
*.p3 {\
background-color: lightgreen;\
border-color: green; \
}\
*.p1 {\
background-color: #CC33FF;\
border-color: purple; \
}\
*.p4 {\
background-color: yellow;\
border-color: orange; \
}\
*.p2 {\
background-color: lightblue;\
border-color: blue; \
}\
*.actionPhase {\
background-color: rgb(240,240,240);\
}\
*.buyPhase {\
background-color: rgb(253,225,100);\
}\
*.cleanUpPhase {\
background-color: rgb(254,143,78);\
}\
span.phase {\
display: inline-block;\
width: 15px;\
text-align: center;\
}\
span.player {\
padding: 0px 3px;\
}\
span.indent {\
padding-left: 20px;\
}\
vp-chip\
 { background-color:rgb(0,0,0) ; border-radius: 4px; padding: 0px 3px;\
   color:rgb(255,255,255) ; }\
";
    var singletypes = {
    action: 'rgb(240,240,240)',
    treasure: 'rgb(253,225,100)',
    reaction: 'rgb(64,168,227)',
    duration: 'rgb(254,143,78)',
    victory: 'rgb(146,193,125)',
    curse: 'rgb(215,138,219)',
    ruins: 'rgb(150,104,51)',
    shelter: 'rgb(230,108,104)' };
    for (var i in singletypes)
	style += i + "{ background-color:"+singletypes[i]+"; border-radius: 4px; padding: 0px 3px;}";
    var doubletypes = {
	'treasure-victory': 'rgb(253,225,100), rgb(146,193,125)',
	'treasure-reaction': 'rgb(253,225,100), rgb(64,168,227)',
	'victory-reaction': 'rgb(146,193,125), rgb(64,168,227)',
	'shelter-reaction': 'rgb(230,108,104), rgb(64,168,227)',
	'action-shelter': 'rgb(240,240,240), rgb(230,108,104)',
	'shelter-victory': 'rgb(230,108,104), rgb(146,193,125)',
	'action-victory': 'rgb(240,240,240), rgb(146,193,125)',
    }
    for (var i in doubletypes)
	style += i + "\
{ background: -moz-linear-gradient(top, "+doubletypes[i]+");\
  background: -webkit-linear-gradient(top, "+doubletypes[i]+");\
  background: -o-linear-gradient(top, "+doubletypes[i]+");\
  background: -ms-linear-gradient(top, "+doubletypes[i]+");\
  background: linear-gradient(top, "+doubletypes[i]+"); border-radius: 6px; padding: 0px 3px;}";
    addStyle(style);
}
var types = {
'Border Village':'action',
'Farming Village':'action',
'Mining Village':'action',
'Native Village':'action',
'Walled Village':'action',
'Worker\'s Village':'action',
'Ruined Village':'ruins',
'Fishing Village':'duration',
'Village':'action',
'Ruined Library':'ruins',
'Library':'action',
'Abandoned Mine':'ruins',
'Mine':'action',
'Bag of Gold':'action',
'Fool\'s Gold':'treasure-reaction',
'Gold':'treasure',
'Overgrown Estate':'shelter-victory',
'Estate':'victory',
'Counting House':'action',
'Count':'action',
'Coppersmith':'action',
'Copper':'treasure',
'Ruined Market':'ruins',
'Grand Market':'action',
'Black Market':'action',
'Market Square':'reaction',
'Market':'action',
'Adventurer':'action',
'Alchemist':'action',
'Altar':'action',
'Ambassador':'action',
'Apothecary':'action',
'Apprentice':'action',
'Armory':'action',
'Band of Misfits':'action',
'Bandit Camp':'action',
'Baron':'action',
'Bazaar':'action',
'Bishop':'action',
'Bridge':'action',
'Bureaucrat':'action',
'Cartographer':'action',
'Catacombs':'action',
'Cellar':'action',
'Chancellor':'action',
'Chapel':'action',
'City':'action',
'Conspirator':'action',
'Council Room':'action',
'Courtyard':'action',
'Crossroads':'action',
'Cultist':'action',
'Cutpurse':'action',
'Dame Anna':'action',
'Dame Molly':'action',
'Dame Natalie':'action',
'Dame Sylvia':'action',
'Death Cart':'action',
'Develop':'action',
'Duchess':'action',
'Embargo':'action',
'Embassy':'action',
'Envoy':'action',
'Expand':'action',
'Explorer':'action',
'Familiar':'action',
'Feast':'action',
'Festival':'action',
'Followers':'action',
'Forager':'action',
'Forge':'action',
'Fortress':'action',
'Fortune Teller':'action',
'Ghost Ship':'action',
'Golem':'action',
'Goons':'action',
'Governor':'action',
'Graverobber':'action',
'Haggler':'action',
'Hamlet':'action',
'Harvest':'action',
'Herbalist':'action',
'Hermit':'action',
'Highway':'action',
'Hunting Grounds':'action',
'Hunting Party':'action',
'Inn':'action',
'Ironmonger':'action',
'Ironworks':'action',
'JackOfAllTrades':'action',
'Jester':'action',
'Junk Dealer':'action',
'King\'s Court':'action',
'Knights':'action',
'Laboratory':'action',
'Lookout':'action',
'Madman':'action',
'Mandarin':'action',
'Marauder':'action',
'Margrave':'action',
'Masquerade':'action',
'Menagerie':'action',
'Mercenary':'action',
'Militia':'action',
'Minion':'action',
'Mint':'action',
'Moneylender':'action',
'Monument':'action',
'Mountebank':'action',
'Mystic':'action',
'Navigator':'action',
'Noble Brigand':'action',
'Nomad Camp':'action',
'Oasis':'action',
'Oracle':'action',
'Pawn':'action',
'Pearl Diver':'action',
'Peddler':'action',
'Pillage':'action',
'Pirate Ship':'action',
'Poor House':'action',
'Possession':'action',
'Princess':'action',
'Procession':'action',
'Rabble':'action',
'Rats':'action',
'Rebuild':'action',
'Remake':'action',
'Remodel':'action',
'Rogue':'action',
'Saboteur':'action',
'Sage':'action',
'Salvager':'action',
'Scavenger':'action',
'Scheme':'action',
'Scout':'action',
'Scrying Pool':'action',
'Sea Hag':'action',
'Shanty Town':'action',
'Sir Bailey':'action',
'Sir Destry':'action',
'Sir Martin':'action',
'Sir Michael':'action',
'Sir Vander':'action',
'Smithy':'action',
'Smugglers':'action',
'Spice Merchant':'action',
'Spy':'action',
'Squire':'action',
'Stables':'action',
'Steward':'action',
'Storeroom':'action',
'Swindler':'action',
'Thief':'action',
'Throne Room':'action',
'Torturer':'action',
'Tournament':'action',
'Trade Route':'action',
'Trading Post':'action',
'Transmute':'action',
'Treasure Map':'action',
'Treasury':'action',
'Tribute':'action',
'Trusty Steed':'action',
'University':'action',
'Upgrade':'action',
'Urchin':'action',
'Vagrant':'action',
'Vault':'action',
'Wandering Minstrel':'action',
'Warehouse':'action',
'Wishing Well':'action',
'Witch':'action',
'Young Witch':'action',
'Woodcutter':'action',
'Workshop':'action',
'Beggar':'reaction',
'Watchtower':'reaction',
'Horse Traders':'reaction',
'Moat':'reaction',
'Secret Chamber':'reaction',
'Trader':'reaction',
'Bank':'treasure',
'Cache':'treasure',
'Contraband':'treasure',
'Counterfeit':'treasure',
'Diadem':'treasure',
'Hoard':'treasure',
'Horn of Plenty':'treasure',
'Ill-Gotten Gains':'treasure',
'Loan':'treasure',
'Philosopher\'s Stone':'treasure',
'Platinum':'treasure',
'Potion':'treasure',
'Quarry':'treasure',
'Royal Seal':'treasure',
'Silver':'treasure',
'Spoils':'treasure',
'Stash':'treasure',
'Talisman':'treasure',
'Venture':'treasure',
'Colony':'victory',
'Duchy':'victory',
'Duke':'victory',
'Fairgrounds':'victory',
'Farmland':'victory',
'Feodum':'victory',
'Gardens':'victory',
'Province':'victory',
'Silk Road':'victory',
'Vineyard':'victory',
'Caravan':'duration',
'Haven':'duration',
'Lighthouse':'duration',
'Merchant Ship':'duration',
'Outpost':'duration',
'Tactician':'duration',
'Wharf':'duration',
'Survivors':'ruins',
'Ruins':'ruins',
'Dame Josephine':'action-victory',
'Great Hall':'action-victory',
'Nobles':'action-victory',
'Island':'action-victory',
'Harem':'treasure-victory',
'Hovel':'shelter-reaction',
'Necropolis':'action-shelter',
'Tunnel':'victory-reaction',
'victory point chips':'vp-chip',
'Curse':'curse',
}

var cards = Object.keys(types);
var reg = new RegExp(cards.sort(function(a,b){return b.length-a.length}).join('|'),'g');
function colorize(x) {
    return x.replace(reg,function (m) {var t = types[m]; return "<"+t+">"+m+"</"+t+">"});
}

var vpoint = {
'Estate':function() {return 1},
'Colony':function() {return 10},
'Duchy':function() {return 3},
'Duke':function(d) {return d.Dutchy ? d.Dutchy : 0;},
'Fairgrounds':function(d) {var s=0;for(var c in d){if(s[c]>0)s++};return Math.floor(s/5)},
'Farmland':function() {return 2},
'Feodum':function(d) {return d.Silver ? Math.floor(d.Silver/3) : 0;},
'Gardens':function(d) {var s=0;for(var c in d){s+=d[c];};return Math.floor(s/10)},
'Province':function() {return 6},
'Silk Road':function(d) {var s=0;for(var c in d)if(types[c].matches(/victory/)){s+=d[c];};return Math.floor(s/4)},
'Vineyard':function(d) {var s=0;for(var c in d)if(types[c].matches(/action/)){s+=d[c];};return Math.floor(s/3)},
//'Overgrown Estate':function() {return 0},
'Dame Josephine':function() {return 2},
'Great Hall':function() {return 1},
'Nobles':function() {return 2},
'Island':function() {return 2},
'Harem':function() {return 2},
'Tunnel':function() {return 2},
'Curse':function() {return -1},
}
function vp_in_deck(deck) {
    var points = 0;
    for (var card in deck) if(vpoint[card]) {
	points += deck[card] * vpoint[card](deck);
    }
    return points;
}

Goko.Player.old_AvatarLoader = Goko.Player.AvatarLoader;
Goko.Player.AvatarLoader = function(userdata,callback) {
	function loadImage() {
		var img = new Image();
		img.onerror = function() { Goko.Player.old_AvatarLoader(userdata,callback); };
		img.onload = function() { callback(img); };
		img.src = "http://dom.retrobox.eu/avatars/"+userdata.player.id+".png";
	}
	if (userdata.which < 3) {
	    loadImage();
	} else {
	    Goko.Player.old_AvatarLoader(userdata,callback);
	}
}

FS.Templates.LaunchScreen.MAIN = FS.Templates.LaunchScreen.MAIN.replace('<div id="fs-player-pad-avatar"',
'<div style="display:none"><form id="uploadAvatarForm" method="post" action="http://dom.retrobox.eu/setavatar.php"><input type="text" id="uploadAvatarId" name="id" value="x"/></form></div>'+
'<div id="fs-player-pad-avatar" onClick="'+
'document.getElementById(\'uploadAvatarId\').setAttribute(\'value\',Goko.ObjectCache.getInstance().conn.connInfo.playerId);'+
'document.getElementById(\'uploadAvatarForm\').submit();'+
'"');
//'<div id="fs-player-pad-avatar" onClick="window.open(\'http://dom.retrobox.eu/setavatar.php?id=\'+Goko.ObjectCache.getInstance().conn.connInfo.playerId);"');
