gameInspector = {};
var ld = require('lodash');

var getCurruntPlayerIndex=function(players){
	return ld.findIndex(players, function(player) {
 		return player.myTurn == true;
	});
}

gameInspector.apprisePlayersTurn = function(players){	
	var currentPlayerIndex = getCurruntPlayerIndex(players);
	var hostTurn = players.every(function(player){
		return player.myTurn == false;
	});
	if(hostTurn){
		players[0].myTurn = true;
	}else{
		players[currentPlayerIndex].myTurn = false;
		if(currentPlayerIndex+1 == players.length) currentPlayerIndex = -1;
		players[currentPlayerIndex + 1].myTurn = true;
	};
	return players;
};

gameInspector.throwCard = function(gameData){
	var players=gameData.players;
	var currentPlayerIndex = getCurruntPlayerIndex(players);
	var player = players[currentPlayerIndex];
	var indexOfCard = ld.findIndex(player.hand,function(card){
		return ld.isEqual(card,gameData.cardToBeThrown);
	});
	var threwCard = player.hand.splice(indexOfCard,1);
	gameData.discardedPile.push(threwCard[0]);
	var resultObject={
		players:players,
		discardedPile:gameData.discardedPile,
		drawPile:gameData.drawPile		
	};
	return resultObject;
};
gameInspector.pickCard = function(gameData){
	var players=gameData.players;
	var currentPlayerIndex = getCurruntPlayerIndex(players);
	var swipedCards=gameData.drawPile.splice("-"+gameData.noOfCards);
	players[currentPlayerIndex].cat(swipedCards);
	players[currentPlayerIndex].saidUno = false
	var resultObject={
		players:players,
		discardedPile:gameData.discardedPile,
		drawPile:gameData.drawPile		
	};
	return resultObject;
};

gameInspector["plusFour"] = function(gameData){
	gameData.noOfCards=4;
	var wildCard = gameData.discardedPile[gameData.discardedPile.length-1];
	wildCard.color = gameData.color;
	gameData = gameInspector.pickCard(gameData);
	gameData.players = gameInspector.apprisePlayersTurn(gameData.players);
	return gameData;
};

gameInspector.skip = function(gameData){
	gameData.players=gameInspector.apprisePlayersTurn(gameData.players);
	return gameData;
};

gameInspector.reverse = function(gameData){
	var currentPlayerIndex = getCurruntPlayerIndex(gameData.players);
	var previousPlayer = (currentPlayerIndex == 0) 
	? gameData.players[gameData.players.length-1]
	: gameData.players[currentPlayerIndex-1];
	previousPlayer.myTurn = true;
	gameData.players[currentPlayerIndex].myTurn=false;
	gameData.players.reverse();
	gameData.players=gameInspector.apprisePlayersTurn(gameData.players);
	return gameData;
};

gameInspector.wildCard = function(gameData){
	gameData.discardedPile[gameData.discardedPile.length-1].color=gameData.color;
	return gameData;
};

gameInspector.plusTwo = function(gameData){
	gameData.noOfCards = 2;
	var penaltyCards = gameData.noOfCards;
	var currentPlayer = gameData.players[getCurruntPlayerIndex(gameData.players)];
	gameData = gameInspector.pickCard(gameData);
	gameInspector.apprisePlayersTurn(gameData.players);
	gameData.noOfCards = penaltyCards;
	return gameData;
};

exports.gameInspector = gameInspector;
