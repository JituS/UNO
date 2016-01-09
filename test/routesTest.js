var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var game = {};
var controller = require('../lib/controller.js');
var routes;
var sinon = require('sinon');
var game;

describe('routes',function(){
	beforeEach(function(){
		routes = undefined;
		game = {};
	})
	describe('get /',function(){
		it('should serve the login page',function(done){
			game.IDs = [];
			game.players = [];
			var routes = controller(game);
			request(routes)
				.get('/')
				.expect(302)
				.expect('Location','./index.html',done);
		});
	});

	describe('get /provideIndexForm',function(){
		it('should give give login fields',function(done){
			game.hasPlayers = sinon.spy();
			var routes = controller(game);
			request(routes)
				.get('/provideIndexForm')
				.expect(200)
				.expect(/Enter your name/)
				.end(function(){
					assert.ok(game.hasPlayers.called);
					done();
				});
		});

	});

	describe('post /addPlayer',function(){
		it('should send players who all are playing to the host player',function(done){
			game.IDs = [];
			game.hasPlayers = sinon.stub().withArgs().returns(false);
			game.setLimit = sinon.stub().withArgs(2);
			game.isPlayerInGame = sinon.stub().withArgs().returns(false);
			game.addPlayer = function(player){game.players.push(player) }
			game.players = [];
			game.playersLimit = 0;
			var routes = controller(game);
			request(routes)
				.post('/addPlayer')
				.send('name=jitendra&playersLimit=2')
				.set('Cookie',['name=12345667'])
				.expect(200)
				.expect('Game is going on between(.*) : <br>jitendra',done)
				.end(function(){
					assert.ok(game.hasPlayers.called);
					assert.ok(game.setLimit.called);
					assert.ok(game.isPlayerInGame.called);
					done();
				});
		});	
	});
	describe('post /indexRefreshData',function(){
		it('should send an object if player limit reached',function(done){
			game.allPlayersJoined = sinon.stub().withArgs().returns(true);
			var routes = controller(game);
			request(routes)
				.post('/indexRefreshData')
				.expect(200)
				.set('Cookie',['name=12345668'])
				.expect(/{"reachedPlayersLimit":true,"url":"gamePage.html"}/,done);
		});	
	});
	describe('post /indexRefreshData',function(){
		it('should send a string if player limit did not reached',function(done){
			game.allPlayersJoined = sinon.stub().withArgs().returns(false);
			var routes = controller(game);
			request(routes)
				.post('/indexRefreshData')
				.expect(200)
				.set('Cookie',['name=12345668'])
				.expect(/Game is going on between/,done);
		});	
	});
});
