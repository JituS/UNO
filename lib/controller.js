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
var games = [];

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var getRandomNumber = function(){
	var randomNumber = Math.random();
	return randomNumber;
};

var checkLogin = function(req){
	var player = JSON.parse(req.cookies.id);
	return !!(player && req.game && ld.find(req.game.players,{id:player.id}))
};

app.get('/allGames',function(req, res){
	(req.cookies.id)
	? res.send(JSON.stringify(games));
	: res.redirect('./index.html');
});
app.get('/allGame.html',function(req, res, next){
	(req.cookies.id) 
	? next();
	: res.redirect('./index.html');
});

app.get('/',function(req,res){
	(req.cookies.id && checkLogin(req))
	? res.redirect('./gamePage.html')
	: res.redirect('./index.html');
});

app.use(express.static('./public'));

app.get('/provideIndexForm',function(req,res){
	res.send(index);
});

app.post('/addPlayer',function(req,res){
	var id = getRandomNumber();
	var requester = req.body;
	var player = new lib.Player(requester.name, id);
	res.cookie('id',JSON.stringify(player));
	res.send(JSON.stringify({newPage:'allGame.html'}));
});

app.post('/createNewGame', function(req, res){
	var player = JSON.parse(req.cookies.id);
	var croupier = new lib.Croupier([player]);
	var game = new Game(croupier);
	game.id = games.length;
	game.players.push(player);
	game.setLimit(req.body.limit);
	games.push(game);
	res.send();
});	


app.post('/joinGame',function(req, res){
	var gameID = req.body.gameID;
	var player = JSON.parse(req.cookies.id);
	var game = ld.find(games,{id:+gameID});
	if(game && !ld.some(game.players,{id:player.id})){
		game.addPlayer(player);
	};
});

app.get('/startGame',function(req, res){
	var content = (req.game && req.game.allPlayersJoined())
	? {gameStarted:true, url:'gamePage.html'}
	: {gameStarted:false, url:'gamePage.html'};
	res.send(content);
});

var createTableForEachPlayers = function(game,player){
	var table={};
	table.player = player;
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
	var game = req.game;
	var player = JSON.parse(req.cookies.id);
	if(game){
		if(!game.isPlayerInGame(player.id)){
			res.send();
			return;
		}
		else if(game && !game.gameStarted){
			game.croupier.distributeCards();
			game.croupier.openInitialCard();
			game.gameStarted = true;	
			gameInspector.apprisePlayersTurn(game.croupier.players);
		};
		player = game.getPlayer(player.id);
		res.send(JSON.stringify(createTableForEachPlayers(game, player)));	
	} else res.send();
});

app.post('/cardPosition',function(req,res){
	var playerId = JSON.parse(req.cookies.id).id;
	var player = req.game.getPlayer(playerId);
	var cards = JSON.parse(req.body['cards']);
	player.hand = cards;
	res.send();
});

app.post('/throwCard',function(req,res){
	var playerId = JSON.parse(req.cookies.id).id;
	var playedCard = JSON.parse(req.body.card);
	var color = req.body.color;
	req.game.croupier.makeMove(playerId,playedCard,color);
	var player = req.game.getPlayer(playerId);
	res.send(JSON.stringify(createTableForEachPlayers(req.game,player)));
});

app.post('/drawCard',function(req,res){
	var playerId = JSON.parse(req.cookies.id).id;
	var currentPlayer = req.game.croupier.getPlayerDetails(playerId);
	req.game.recentMove=">> "+currentPlayer.name+" has drawn a card"+"<br>"+req.game.recentMove;
	req.game.croupier.makeMove(playerId);
	var player = req.game.getPlayer(playerId);
	res.send(JSON.stringify(createTableForEachPlayers(req.game,player)));
});

app.post('/changeTurn',function(req,res){
	var playerId = JSON.parse(req.cookies.id).id;
	var currentPlayer = req.game.croupier.getPlayerDetails(playerId);
	if(lib.checkEligibility(currentPlayer,req.game.croupier.players)){
		req.game.croupier.players = gameInspector.apprisePlayersTurn(req.game.croupier.players);	
	}
	var player = req.game.getPlayer(playerId);
	res.send(JSON.stringify(createTableForEachPlayers(req.game,player)));
});

app.post('/sayUno',function(req,res){
	var player = req.game.croupier.getPlayerDetails(req.cookies.id);
	req.game.recentMove=">> "+player.name + " said UNO <br>"+req.game.recentMove;
	var unoSaid = req.game.croupier.sayUno(player);
	res.send();
});

app.post('/catchUno',function(req,res){
	var name = req.body.name;
	var playerID = JSON.parse(req.cookies.id).id;
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

app.get('/restartGame',function(req,res){
	(req.game) && ld.remove(games,req.game)
	res.send("./allGame.html");
});

var logs = function(req){
	console.log('ip -->',req.connection.remoteAddress, '\ncookie -->', queryString.parse(req.headers.cookie).id,'\nurl-->',req.url,'\nmethod-->',req.method,'\n---------------------------------------');
};

var controller = function(game){
	return function(req,res){
		logs(req);
		var player = queryString.parse(req.headers.cookie).id;
		if(player){
			player = JSON.parse(player);
			var game = ld.find(games,function(game){
				return ld.find(game.croupier.players,{id:player.id});
			});
			req.game = game;
		}
		app(req,res);
	};
};

module.exports = controller;
