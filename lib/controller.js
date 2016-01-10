var http = require('http');
var express = require('express');
var app = express();
var ld  = require('lodash');
var queryString = require('querystring');
var lib = require('./croupier.js').lib;
var index = require('./index.json');
var gameInspector = require('./gameInspector.js').gameInspector;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Game = require('./game.js');
var games = [],players = [], playersLimit = undefined;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var getRandomNumber = function(req){
	var randomNumber = Math.random();
	return "name=player"+randomNumber+players.length;
};

var checkLogin = function(req){
	return (req.cookies.id && req.game && ld.find(req.game.players,{id:req.cookies.id}))
	? true : false;
};

app.get('/',function(req,res){
	if(checkLogin(req)) res.redirect('./gamePage.html')
	else res.redirect('./index.html');
});

app.use(express.static('./public'));

app.get('/provideIndexForm',function(req,res){
	var content = (players.length == 0) ? index[1]
		: index[0];
	res.send(content);
});

app.post('/addPlayer',function(req,res){
	var id = getRandomNumber(req);
	res.cookie('id',id);
	var requester = req.body;
	if(players.length == 0){
		playersLimit = +requester.playersLimit;
	}
	var player = new lib.Player(requester.name,id);
	(!ld.some(players,{id:req.cookies.id})) && (players.push(player));
	var content = 'Game is going on between ' + playersLimit + ' players: <br>'+ld.pluck(players,'name').join('<br>');
	res.send(content);
});

var createTableForEachPlayers = function(game,playerId){
	var table={};
	table.player = game.getPlayer(playerId);
	table.otherPlayerHand = game.croupier.players.map(function(player){
		var dataOfPlayerToReturn={};
		dataOfPlayerToReturn["name"] = player.name;
		dataOfPlayerToReturn["hand"] = player.hand.length;
		dataOfPlayerToReturn["myTurn"] = player.myTurn;
		dataOfPlayerToReturn["saidUno"] = player.saidUno;
		return dataOfPlayerToReturn;
	});
	table.recentMove = game.recentMove;
	table.currentPlayer = game.getCurrentPlayer().name;
	table.discardedPile = ld.findLast(game.croupier.discardedPile);
	return table;
};

app.get('/provideTable',function(req,res){
	var game;
	var playerId = req.cookies.id;
	if(req.game && !ld.some(req.game.croupier.players,{id:playerId})){
		res.send();
		return;
	}
	else if(!req.game && playersLimit == players.length){
		var croupier = new lib.Croupier(players);
		game = new Game(croupier);
		game.croupier.distributeCards();
		game.croupier.openInitialCard();
		game.gameStarted = true;	
		gameInspector.apprisePlayersTurn(game.croupier.players);
		players = [];
		playersLimit = undefined;
		games.push(game);
	};
	if(req.game || game) res.send(JSON.stringify(createTableForEachPlayers(req.game || game, playerId)));
	else res.send();
});

app.post('/cardPosition',function(req,res){
	var playerId = req.cookies.id;
	var player = req.game.getPlayer(playerId);
	var cards = JSON.parse(req.body['cards']);
	player.hand = cards;
	res.send();
});

app.post('/throwCard',function(req,res){
	var playerId = req.cookies.id;
	var playedCard = JSON.parse(req.body.card);
	var color = req.body.color;
	req.game.croupier.makeMove(playerId,playedCard,color);
	res.send(JSON.stringify(createTableForEachPlayers(req.game,playerId)));
});

app.post('/indexRefreshData',function(req,res){
	var dataToReturn = (players.length == playersLimit)
	? {reachedPlayersLimit:true, url:"gamePage.html" }
	: 'Game is going on between '+ playersLimit + ' players: <br>'+ld.pluck(players,'name').join('<br>');
	res.send(JSON.stringify(dataToReturn));
});

app.post('/drawCard',function(req,res){
	var playerId = req.cookies.id;
	var currentPlayer = req.game.croupier.getPlayerDetails(playerId);
	req.game.recentMove=">> "+currentPlayer.name+" has drawn a card"+"<br>"+req.game.recentMove;
	req.game.croupier.makeMove(playerId);
	res.send(JSON.stringify(createTableForEachPlayers(req.game,playerId,req.game.croupier)));
});

app.post('/changeTurn',function(req,res){
	var playerID = req.cookies.id;
	var currentPlayer = req.game.croupier.getPlayerDetails(playerID);
	if(lib.checkEligibility(currentPlayer,req.game.croupier.players)){
		req.game.croupier.players = gameInspector.apprisePlayersTurn(req.game.croupier.players);	
	}
	res.send(JSON.stringify(createTableForEachPlayers(req.game,playerID,req.game.croupier)));
});

app.post('/sayUno',function(req,res){
	var player = req.game.croupier.getPlayerDetails(req.cookies.id);
	req.game.recentMove=">> "+player.name + " said UNO <br>"+req.game.recentMove;
	var unoSaid = req.game.croupier.sayUno(player);
	res.send();
});

app.post('/catchUno',function(req,res){
	var name = req.body.name;
	var playerID = req.cookies.id;
	var currentPlayer = req.game.croupier.getPlayerDetails(playerID);
	var player = ld.find(req.game.croupier.players,{name:name});
	var isCaught = req.game.croupier.catchUno(player);
	if(isCaught) req.game.recentMove = ">> "+ name + " was caught for not saying UNO by "+currentPlayer.name+"<br>"+req.game.recentMove;
	res.send();
});

app.post('/checkWinner',function(req,res){
	var players_ = req.game.croupier.players;
	if(lib.checkForEndGame(players_)){
		req.game.croupier.countPoints();
	};
	var pointsInformation = players_.map(function(player){
		return {name:player.name,points:player.points};
	});
	res.send(JSON.stringify(pointsInformation));
});

app.post('/restartGame',function(req,res){
	(req.game) && ld.remove(games,req.game)
	res.send("./");
});

var controller = function(game){
	return function(req,res){
		var id = queryString.parse(req.headers.cookie).id;
		if(id){
			var game = ld.find(games,function(game){
				return ld.find(game.croupier.players,{id:id});
			});
			req.game = game;
		}
		app(req,res);
	};
};

module.exports = controller;