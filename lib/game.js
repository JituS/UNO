var ld  =require('lodash');
var Game = function(croupier){
	this.players = [];
	this.playersLimit = 0;
	this.recentMove = "";
	this.gameStarted = false;
	this.croupier = croupier;
	var self = this;
	this.hasPlayers = function(){
		return self.players.length > 0;
	},
	this.isPlayerInGame=function(playerId){
		return ld.some(self.players,{id:playerId});
	},
	this.allPlayersJoined = function(){
		return self.players.length == self.playersLimit;
	};
	this.setLimit = function(limit){
		self.playersLimit = limit;
	},
	this.addPlayer = function(player){
		if(self.players.length < self.playersLimit){
			self.players.push(player);
			self.croupier.players.push(player);
		}
	},
	this.getCurrentPlayer = function(){
		return ld.find(self.croupier.players,{myTurn:true});
	},
	this.getPlayer = function(playerId){
		return ld.find(self.croupier.players,{id:playerId});
	}
};

module.exports = Game;