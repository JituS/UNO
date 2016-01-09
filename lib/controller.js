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
var IDs = [],games = [];

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var getRandomNumber = function(req){
	var randomNumber = Math.random();
	return "name=player"+randomNumber+req.game.players.length;
};

app.get('/',function(req,res){
	if(req.cookies.id && ld.include(IDs,req.cookies.id)) res.redirect('./gamePage.html')
	else res.redirect('./index.html');
});

app.use(express.static('./public'));

app.get('/provideIndexForm',function(req,res){
	var content = (req.game.hasPlayers()) ? index[0]
		: index[1];
	res.send(content);
});

app.post('/addPlayer',function(req,res){
	var id = getRandomNumber(req);
	IDs.push(id),req.game.IDs.push(id);
	res.cookie('id',id);
	var requester = req.body;
	(!req.game.hasPlayers()) && req.game.setLimit(+requester.playersLimit);
	var player = new lib.Player(requester.name,id);
	(!req.game.isPlayerInGame(req.cookies.id)) && (req.game.addPlayer(player));
	var content = 'Game is going on between '+ req.game.playersLimit + ' players: <br>'+ld.pluck(req.game.players,'name').join('<br>');
	res.send(content);
});

var createTableForEachPlayers = function(req,playerId){
	var table={};
	table.player = req.game.getPlayer(playerId);
	table.otherPlayerHand = req.game.croupier.players.map(function(player){
		var dataOfPlayerToReturn={};
		dataOfPlayerToReturn["name"] = player.name;
		dataOfPlayerToReturn["hand"] = player.hand.length;
		dataOfPlayerToReturn["myTurn"] = player.myTurn;
		dataOfPlayerToReturn["saidUno"] = player.saidUno;
		return dataOfPlayerToReturn;
	});
	table.recentMove = req.game.recentMove;
	table.currentPlayer = req.game.getCurrentPlayer().name;
	table.discardedPile = ld.findLast(req.game.croupier.discardedPile);
	return table;
};

app.get('/provideTable',function(req,res){
	var playerId = req.cookies.id;
	if(!req.game.isPlayerInGame(playerId)){
		res.send();
		return;
	}
	else if(!req.game.gameStarted){
		req.game.croupier = new lib.Croupier(req.game.players);
		req.game.croupier.distributeCards();
		req.game.croupier.openInitialCard();
		req.game.gameStarted = true;	
		gameInspector.apprisePlayersTurn(req.game.croupier.players);
	}
	res.send(JSON.stringify(createTableForEachPlayers(req,playerId)));
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
	res.send(JSON.stringify(createTableForEachPlayers(req,playerId)));
});

app.post('/indexRefreshData',function(req,res){
	var dataToReturn = (req.game.allPlayersJoined()) 
	? {reachedPlayersLimit:true, url:"gamePage.html" }
	: 'Game is going on between '+ req.game.playersLimit + ' players: <br>'+ld.pluck(req.game.players,'name').join('<br>');
	res.send(JSON.stringify(dataToReturn));
});

app.post('/drawCard',function(req,res){
	var playerId = req.cookies.id;
	var currentPlayer = req.game.croupier.getPlayerDetails(playerId);
	req.game.recentMove=">> "+currentPlayer.name+" has drawn a card"+"<br>"+req.game.recentMove;
	req.game.croupier.makeMove(playerId);
	res.send(JSON.stringify(createTableForEachPlayers(req,playerId,req.game.croupier)));
});

app.post('/changeTurn',function(req,res){
	var playerID = req.cookies.id;
	var currentPlayer = req.game.croupier.getPlayerDetails(playerID);
	if(lib.checkEligibility(currentPlayer,req.game.croupier.players)){
		req.game.croupier.players = gameInspector.apprisePlayersTurn(req.game.croupier.players);	
	}
	res.send(JSON.stringify(createTableForEachPlayers(req,playerID,req.game.croupier)));
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
	players = req.game.croupier.players;
	if(lib.checkForEndGame(players)){
		req.game.croupier.countPoints();
	};
	var pointsInformation = req.game.croupier.players.map(function(player){
		return {name:player.name,points:player.points};
	});
	res.send(JSON.stringify(pointsInformation));
});

app.post('/restartGame',function(req,res){
	if(req.game == undefined){res.clearCookie('id')}
	else res.clearCookie('id') && ld.remove(games,req.game)
	res.send("./");
});

var controller = function(game){
	games = [];
	games.push(game);
	return function(req,res){
		var id = queryString.parse(req.headers.cookie).id;
		if(!ld.include(IDs,id) && ld.every(games,{gameStarted:true})){
			games.push(new Game());	
			currentGame = games[games.length-1];
		}
		else if(games.length == 1){
			currentGame = games[0];
		}
		else if(!ld.include(IDs,id) && !games[games.length-1].gameStarted){
			currentGame = games[games.length-1];
		}
		else{
			currentGame = games.filter(function(each){
				return ld.include(each.IDs,id);
			});	
			currentGame = currentGame[0];
		};
		req.game = currentGame;
		app(req,res);
	};
};

module.exports = controller;
