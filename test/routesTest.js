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
			var routes = controller(game);
			request(routes)
				.get('/')
				.expect(302)
				.expect('Location','/index.html',done);
		});
	});

	describe('get /provideIndexForm',function(){
		it('should give give login fields',function(done){
			var routes = controller(game);
			request(routes)
				.get('/provideIndexForm')
				.expect(200)
				.expect(/Enter your name/,done);
		});
	});

	describe('post /addPlayer',function(){
		it('should add the cookie and send the link of allGame.html',function(done){
			var routes = controller(game);
			request(routes)
				.post('/addPlayer')
				.send('name=jitendra')
				.set('Cookie',['12345667'])
				.expect(200)
				.expect('{"newPage":"allGame.html"}',done);
		});	
	});

	describe('get /startGame',function(){
		it('starts the game if all players has been joined the game',function(done){
			game.allPlayersJoined = sinon.stub().returns(true);
			game.addCroupier = sinon.spy();
			var routes = controller(game);
			request(routes)
				.get('/startGame')
				.expect(200)
				.expect({gameStarted:true, url:'gamePage.html'})
				.end(function(){
					assert.ok(game.addCroupier.calledOnce);
					assert.ok(game.allPlayersJoined.calledWith());
					done();
				});
		});	
	});

	describe('get /startGame',function(){
		it('dont starts the game if all players had not joined the game',function(done){
			game.allPlayersJoined = sinon.stub().returns(false);
			game.addCroupier = sinon.spy();
			var routes = controller(game);
			request(routes)
				.get('/startGame')
				.expect(200)
				.expect({gameStarted:true, url:'gamePage.html'})
				.end(function(){
					assert.ok(!game.addCroupier.calledOnce);
					assert.ok(game.allPlayersJoined.calledWith());
					done();
				});
		});	
	});
});


