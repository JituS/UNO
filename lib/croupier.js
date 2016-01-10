var ld = require ('lodash');
var lib = {};
exports.lib = lib;
var deck = require('./cards').getNewDeck;
var gameInspector = require('./gameInspector.js').gameInspector;

lib.shuffleCards = function(newCards){
	return ld.shuffle(newCards);
};

lib.Croupier = function(players){
	this.drawPile = lib.shuffleCards(deck());
	this.players = players;
	this.discardedPile = [];
};

var getCurrentPlayer=function(players){
	return ld.find(players,{myTurn : true});
}

lib.Croupier.prototype.distributeCards = function(){
	var drawPile = this.drawPile;
	return this.players.map(function(player){
		player.hand = drawPile.splice(0,7);
		return player;
	});
};

lib.Croupier.prototype.openInitialCard = function(){
	var card = this.drawPile.shift();
	while(lib.isActionCard(card)){
		var removedCard = card; 
		card = this.drawPile.shift();
		this.drawPile.push(removedCard);
	};
	this.discardedPile.push(card);
};

lib.Croupier.prototype.applySimpleCard=function(card){
	var gameData = {
		discardedPile: this.discardedPile,
		drawPile: this.drawPile,
		players: this.players,
		cardToBeThrown:card
	};
	if(card) var updatedData = gameInspector["throwCard"](gameData);
	this.discardedPile = updatedData.discardedPile;
	this.drawPile = updatedData.drawPile;
	this.players = updatedData.players;
	this.players = gameInspector.apprisePlayersTurn(this.players);
};

lib.Croupier.prototype.countPoints = function(){
	this.players.map(function(player){
		var points = 0;
		player.hand.forEach(function(card){
			points += card.point;
		});
		player.points = points;
	});
};

lib.Croupier.prototype.applyAction = function(card,color){
	var gameData = {
		discardedPile: this.discardedPile,
		drawPile: this.drawPile,
		players: this.players,
		color:color
	};
	var updatedData = gameInspector[card.action](gameData);
	this.discardedPile = updatedData.discardedPile;
	this.drawPile = updatedData.drawPile;
	this.players = updatedData.players;
};

lib.Croupier.prototype.getPlayerDetails = function(ID){
	return ld.find(this.players,{id:ID});
};

lib.Croupier.prototype.makeMove = function(playerID,thrownCard,color){
	var currentPlayer = this.getPlayerDetails(playerID);
	console.log(playerID);
	var topMostCard = this.discardedPile[this.discardedPile.length-1];
	var validCards = currentPlayer.hand.filter(function(card){
		return topMostCard.color == card.color || topMostCard.name == card.name;
	});
	(validCards.length == 1) && (validCards[0].name == 'plusFour') && validCards.pop();
	if(lib.checkEligibility(currentPlayer,this.players)){
		if(!thrownCard) this.getACard();
		else if(validCards.length != 0 && color != 'undefined' && thrownCard.name == 'plusFour') return;
		else{
			this.applySimpleCard(thrownCard);
			if(lib.isActionCard(thrownCard)) this.applyAction(thrownCard,color);
		};
	};
};

lib.Croupier.prototype.getACard  = function(){
	(this.drawPile.length<=0) && lib.fillDrawPile(this);
	var cardToBeGiven = this.drawPile.pop();
 	var currentPlayer = getCurrentPlayer(this.players);
 	currentPlayer.hand.push(cardToBeGiven);
 	currentPlayer.saidUno = false;
 };

lib.Croupier.prototype.sayUno = function(playerWhoClaimed){
	if(playerWhoClaimed.saidUno) return;
	var eligibleForUno = ld.find(this.players,{id:playerWhoClaimed.id});
	if(eligibleForUno.hand.length == 1) eligibleForUno.saidUno = true;
};

lib.Croupier.prototype.catchUno = function(player){
	if(player.hand.length == 1 && player.saidUno == false){
		player.hand.push(this.drawPile.pop());
		player.hand.push(this.drawPile.pop());
		return true;
	};
	return false;
};

lib.Player = function(name,id){
	this.name = name;
	this.id = id;
	this.hand = [];
	this.myTurn = false;
	this.saidUno = false;
};

lib.checkEligibility = function(currPlayer,players){
	var currentPlayer = ld.find(players,{myTurn:true});
	if(!currentPlayer) return false;
	return currPlayer.id == currentPlayer.id;
};

lib.matchCard = function(discardedPile){
	var topCard = discardedPile[discardedPile.length-1];
	var secondCard = discardedPile[discardedPile.length-2];
	return topCard.name == "wildCard"
	||topCard.name == "plusFour"
	||topCard.color == secondCard.color
	||topCard.name == secondCard.name ;
};

lib.isActionCard = function(card){
	return card.action != 'simpleCard';
};

lib.checkForEndGame = function(players){
	var winner = players.filter(function(player){
		return player.hand.length == 0;
	});
	return winner.length == 1;
};

lib.fillDrawPile = function(data){
	var drawnFromDiscardedPile = data.discardedPile.splice(0,data.discardedPile.length-1);
	drawnFromDiscardedPile = drawnFromDiscardedPile.map(function(each){
		if(each.name=='plusFour' || each.name=='wildCard'){
			each.color=null;
		}
		return each;
	});
	data.drawPile = data.drawPile.concat(lib.shuffleCards(drawnFromDiscardedPile));
};
