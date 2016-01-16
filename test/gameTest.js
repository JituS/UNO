var chai = require('chai');
var Game = require('../lib/game.js');
var should = chai.should();
var expect = chai.expect;
var assert = chai.assert;
var ld = require("lodash");
var game = new Game();
describe('Game',function(){
	beforeEach(function(){
		game = new Game();
	});
	describe('hasPlayer',function(){
		it('gives true player is available in the game',function(){
			assert.notOk(game.hasPlayers());
			game.players.length = 1;
			assert.ok(game.hasPlayers());
		});
	});
	describe('isPlayerInGame',function(){
		it('tells whether given player is in game or not',function(){
			game.players.push({id:1,name:'arun'});
			assert.ok(game.isPlayerInGame(1));
			assert.notOk(game.isPlayerInGame(2));
		});	
	});
	describe('allPlayersJoined',function(){
		it('tells whether all players has joined the game or not',function(){
			game.players.length = 1;
			game.playersLimit = 2;
			assert.notOk(game.allPlayersJoined());
			game.players.length = 2;
			game.playersLimit = 2;
			assert.ok(game.allPlayersJoined());
		});
	});
	describe('setLimit',function(){
		it('sets the limit of players that can join the game',function(){
			assert.equal(game.playersLimit,0);
			game.setLimit(2);
			assert.equal(game.playersLimit,2);
		});
	});
	describe('addPlayer',function(){
		it('adds the player in the game if limit did not reached',function(){
			game.playersLimit = 1;
			var player1 = {id:1,name:'arun'};
			var player2 = {id:2,name:'varun'};
			game.addPlayer(player1);
			assert.equal(game.players.length,1);
			assert.deepEqual(game.players,[{id:1,name:'arun'}]);
			game.addPlayer(player2);
			assert.equal(game.players.length,1);
		});
	});
	describe('getCurrentPlayer',function(){
		it('gives the player whose turn is true',function(){
			game.players = [{id:1,name:'arun',myTurn:false},{id:2,name:'varun',myTurn:true}];
			assert.deepEqual(game.getCurrentPlayer(),{id:2,name:'varun',myTurn:true});
		});
	});
	describe('getPlayer',function(){
		it('gives takes playerId and gives the full player object',function(){
			var player1 = {id:1,name:'arun',myTurn:true,hand:[]};
			var player2 = {id:2,name:'varun',myTurn:false,hand:[]};
			game.players = [player1,player2];
			assert.deepEqual(game.getPlayer(1),player1);
			assert.deepEqual(game.getPlayer(2),player2);
		});
	});
});
