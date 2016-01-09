var chai = require('chai');
var lib = require('../lib/croupier.js').lib;
var getNewDeck = require('../lib/cards.js').getNewDeck;
var should = chai.should();
var expect = chai.expect;
var assert = chai.assert;
var ld = require("lodash");
var gameInspector = require('../lib/gameInspector.js').gameInspector;

describe("shuffle",function(){
	it("shuffle 108 cards",function(){
		expect(lib.shuffleCards).to.be.a("function");
		var cards = getNewDeck();
		expect(cards).to.have.length(108);
		var shuffledCards = lib.shuffleCards(cards);
		expect(shuffledCards).to.have.length(108);
	});
});

describe("croupier",function(){
	var croupier,simran,jitu;
	beforeEach(function(){
		simran = new lib.Player("simran","10.124.132.24");
		jitu = new lib.Player("jitu","10.124.132.27");
		croupier = new lib.Croupier([simran,jitu]);
	});

	it("creates a new croupier which is a constructor",function(){
		expect(lib.Croupier).to.be.a("function");
		expect(croupier).to.be.an.instanceof(lib.Croupier);
	});	
	it("knows all the details of the players",function(){
		expect(croupier).to.have.property("players");
		expect(croupier.players).to.be.a("array");
	});

	it("has players, discardedPile, drawPile ",function(){
		expect(croupier).to.have.all.keys("players","drawPile","discardedPile");
		expect(croupier.drawPile).to.be.a("array");
		expect(croupier.discardedPile).to.be.a("array");
		expect(croupier.players).to.be.a("array");
	});
	it("has method distribute which distributes cards to the players",function(){
		expect(croupier).to.have.property("distributeCards");
		expect(croupier.distributeCards).to.be.a("function");
		describe("distributeCards",function(){
			it("updates the hand of each player in the arrayOfPlayers",function(){
				var updatedPlayers = croupier.distributeCards();
				croupier.players[0].hand.should.be.an("array").and.have.length(7);
				croupier.players[1].hand.should.be.an("array").and.have.length(7);
				it("updates the drawPile cards" ,function(){
					expect(croupier.drawPile).to.have.length(94);
				});
			});
		});
	});
	it("has method openInitialCard which opens the initial card for players after distribution to players",function(){
		expect(croupier).to.have.property("openInitialCard");
		croupier.openInitialCard();
		expect(croupier.discardedPile).to.have.length(1);
		expect(lib.isActionCard(croupier.discardedPile[0])).to.equal(false);
		expect(croupier.drawPile).to.have.length(107);
	});
	it("has a method for applying action if it is an action card",function(){
		describe("applyAction",function(){
			croupier.players=gameInspector.apprisePlayersTurn(croupier.players);
			croupier.discardedPile.push({name:'plusFour',color:undefined,action:"plusFour"});
			it("calls apprisePlayersTurn and makes myTurn true of the player on which action should be applied",function(){
				croupier.applyAction({name:'plusFour',color:undefined,action:"plusFour"},"blue");
				expect(croupier.players[1].myTurn).to.equal(true);
			});
			it("changes the hand of next player",function(){
				expect(croupier.players[0].hand).to.have.length(11);
				expect(croupier.drawPile).to.have.length(90);
				expect(croupier.discardedPile).to.have.length(1);
			});
		});
		describe("applySimpleCard",function(){
			croupier.players[0].hand=[
				{name:"1",color:"red",action:"simpleCard"},
				{name:"2",color:"red",action:"simpleCard"},
				{name:"3",color:"red",action:"simpleCard"},
				{name:"4",color:"red",action:"simpleCard"},
				{name:"5",color:"red",action:"simpleCard"},
				{name:"6",color:"red",action:"simpleCard"},
				{name:"7",color:"red",action:"simpleCard"}
			];
			it("has a method for applying action ",function(){
				expect(croupier.players[1].hand).to.have.length(7);
				croupier.applySimpleCard(croupier.players[0].hand[2]);
				expect(croupier.players[1].hand).to.have.length(6);
			});
		});
	});
});

describe("Croupier has method `sayUno`",function(){
	lib.shuffleCards();
	var croupier,simran,jitu;
	beforeEach(function(){
		simran = new lib.Player("simran","10.124.132.24");
		jitu = new lib.Player("jitu","10.124.132.27");
		croupier = new lib.Croupier([simran,jitu]);
		croupier.distributeCards();
	});
	it("changes the property saidUno of the player to true is it is eligible to say uno",function(){
		var simran = croupier.players[0];
		var jitu = croupier.players[1];
		simran.hand = simran.hand.slice(6);
		croupier.sayUno(simran);
		expect(simran.saidUno).to.be.a("boolean");
		expect(simran.saidUno).to.equal(true);	
		jitu.hand = jitu.hand.slice(3);
		croupier.sayUno(jitu);
		expect(jitu.saidUno).to.equal(false);	
	});
	describe('Croupier has method `catchUno`',function(){
		it("should catch the player that he didn't yell uno",function(){
			var simran = croupier.players[0];
			var jitu = croupier.players[1];
			simran.hand = simran.hand.slice(6);
			croupier.catchUno(simran);
			expect(simran.hand).to.have.length(3);
			jitu.hand = jitu.hand.slice(6);
			croupier.sayUno(jitu);
			croupier.catchUno(jitu);
			expect(jitu.hand).to.have.length(1);
		});
	});
});

describe("apprise player",function(){
	var simran = new lib.Player("simran","10.124.132.24");
	var jitu = new lib.Player("jitu","10.124.132.27");
	simran.myTurn=true;
	it("apprise the player who will play next",function(){
		expect(gameInspector.apprisePlayersTurn).to.be.a("function");
		var players=gameInspector.apprisePlayersTurn([simran,jitu]);
		expect(players[0].myTurn).to.equal(false);
		expect(players[1].myTurn).to.equal(true);
		players=gameInspector.apprisePlayersTurn([simran,jitu]);
		expect(players[0].myTurn).to.equal(true);
		expect(players[1].myTurn).to.equal(false);
	});
});

describe("Player",function(){
	var simran,madhuri,croupier;
	beforeEach(function(){
		simran = new lib.Player("simran","10.124.132.24");
		madhuri = new lib.Player("madhuri","10.12.21.21");
		croupier = new lib.Croupier([simran,madhuri]);
		lib.shuffleCards();
		croupier.distributeCards();
		simran=croupier.players[0];
		madhuri=croupier.players[1];
	});
	it("creates a new player which is a constructor",function(){
		expect(lib.Player).to.be.a("function");
		expect(simran).to.be.an.instanceof(lib.Player);
		expect(simran).to.be.a("object");
		expect(simran).to.have.all.keys('name','id','hand','myTurn','saidUno');
		expect(simran).to.have.property("name").and.equal("simran");
		expect(simran).to.have.property("id").and.equal("10.124.132.24");
		expect(madhuri).to.have.property("name").and.equal("madhuri");
		expect(madhuri).to.have.property("id").and.equal("10.12.21.21");
	});
});


describe('checkEligibility',function(){
	var simran = new lib.Player("simran","10.124.132.24");
	var jitu = new lib.Player("jitu","10.124.132.27");
	var croupier = new lib.Croupier([simran,jitu]);
	simran = croupier.players[0];
	jitu = croupier.players[1];
	croupier.distributeCards();
	croupier.openInitialCard();
	it('should check whether the current player is eligible to throw card',function(){
		gameInspector.apprisePlayersTurn(croupier.players);
		var player = croupier.players[0];
		expect(lib.checkEligibility(player,croupier.players)).to.equal(true);
		gameInspector.apprisePlayersTurn(croupier.players);
		expect(lib.checkEligibility(player,croupier.players)).to.equal(false);
	});
});

describe('matchCard',function(){
	beforeEach(function(){
		simran = new lib.Player("simran","10.124.132.24");
		madhuri = new lib.Player("madhuri","10.12.21.21");
		croupier = new lib.Croupier([simran,madhuri]);
		simran=croupier.players[0];
		madhuri=croupier.players[1];
		gameInspector.apprisePlayersTurn(croupier.players);
		dataForCardAction={
			players : croupier.players,
			drawPile : croupier.drawPile,
			discardedPile : croupier.discardedPile,
		}
	});
	it('check the top most card of discarded pile and match with thrown card',function(){
		simran.hand.length = 6;
		simran.hand[6] = { color: 'green', name: '3', action: 'simpleCard' };
		var cardToBeThrown = simran.hand[6];
		dataForCardAction.cardToBeThrown=cardToBeThrown;
		dataForCardAction.discardedPile = [{color: 'green', name: '4', action: 'simpleCard' }];
		var dataAfterCardThrown = gameInspector.throwCard(dataForCardAction);
		expect(lib.matchCard(dataAfterCardThrown.discardedPile)).to.equal(true);
	});
	it('return false if wrong card has been thrown',function(){
		simran.hand.length = 6;
		simran.hand[6] = { color: 'red', name: '3', action: 'simpleCard' };
		var cardToBeThrown = simran.hand[6];
		dataForCardAction.cardToBeThrown=cardToBeThrown;
		dataForCardAction.discardedPile = [{color: 'green', name: '4', action: 'simpleCard' }];
		var dataAfterCardThrown=gameInspector.throwCard(dataForCardAction);
		expect(lib.matchCard(dataAfterCardThrown.discardedPile)).to.equal(false);
	});
});


describe("getPlayerDetails",function(){
	var simran = new lib.Player("simran","10.124.132.24");
	var jitu = new lib.Player("jitu","10.124.132.27");
	var croupier = new lib.Croupier([simran,jitu]);
	simran = croupier.players[0];
	jitu = croupier.players[1];
	croupier.distributeCards();
	it("takes the player's ID and gives the whole player object",function(){
		var player = croupier.getPlayerDetails("10.124.132.24")
		player.should.be.an("object");
		assert.ok(ld.isEqual(simran,player));
	});
});

describe("makeMove",function(){
	var jenny = new lib.Player("jenny","10.124.132.24");
	var jitu = new lib.Player("jitu","10.124.132.27");
	var croupier = new lib.Croupier([jenny,jitu]);
		croupier.distributeCards();
		croupier.openInitialCard();	

	it("does nothing if the player is not eligible to throw a card",function(){
		croupier.makeMove("10.124.132.24",({color:"red",name:'2',action:"simpleCard",point:2}));
		expect(croupier.discardedPile).to.have.length(1);
		expect(jenny).to.deep.equal(croupier.players[0]);
	});
	it("push a card to player's hand if player hasn't thrown any card",function(){
		gameInspector.apprisePlayersTurn(croupier.players);
		croupier.makeMove("10.124.132.24");
		expect(jenny.hand).to.have.length(8);
		expect(croupier.discardedPile).to.have.length(1);
		expect(croupier.drawPile).to.have.length(92);
	});
	it("throws the card if the player has thrown a simpleCard and places it into discardedPile",function(){
		jenny.hand = [
			{color:"red",name:'1',action:"simpleCard",point:1},
			{color:"red",name:'2',action:"simpleCard",point:2},
			{color:"red",name:'3',action:"simpleCard",point:3},
			{color:"red",name:'4',action:"simpleCard",point:4},
			{color:"red",name:'5',action:"simpleCard",point:5},
			{color:"red",name:'6',action:"simpleCard",point:6},
			{color:"red",name:'7',action:"simpleCard",point:7},
		];
		croupier.discardedPile[0] = {color:"blue",name:'2',action:"simpleCard",point:1};
		croupier.makeMove("10.124.132.24",{color:"red",name:'2',action:"simpleCard",point:2});
		expect(jenny.hand).to.have.length(6);
		expect(croupier.discardedPile).to.have.length(2);
	});
	it("applies the action if player throws an action card(skip)",function(){
		jitu.hand = [
			{color:"blue",name:'1',action:"simpleCard",point:1},
			{color:"blue",name:'3',action:"simpleCard",point:3},
			{color:"red",name:'skip',action:"skip",point:20},
			{color:"blue",name:'4',action:"simpleCard",point:4},
			{color:"blue",name:'5',action:"simpleCard",point:5},
			{color:"blue",name:'6',action:"simpleCard",point:6},
			{color:"blue",name:'7',action:"simpleCard",point:7},
		];
		croupier.makeMove("10.124.132.27",{color:"red",name:'skip',action:"skip",point:20},"blue");
		expect(jitu.myTurn).to.equal(true);
	});
	it("applies the action if player throws an action card(plusTwo)",function(){
		jitu.hand = [
			{color:"blue",name:'1',action:"simpleCard",point:1},
			{color:"blue",name:'3',action:"simpleCard",point:3},
			{color:"red",name:'plusTwo',action:"plusTwo",point:20},
			{color:"blue",name:'4',action:"simpleCard",point:4},
			{color:"blue",name:'5',action:"simpleCard",point:5},
			{color:"blue",name:'6',action:"simpleCard",point:6},
			{color:"blue",name:'7',action:"simpleCard",point:7},
		];
		croupier.makeMove("10.124.132.27",{color:"red",name:'plusTwo',action:"plusTwo",point:20});
		expect(jitu.hand).to.have.length(6);
		expect(jenny.hand).to.have.length(8);
		expect(croupier.discardedPile).to.have.length(4);
	});
});

describe('checkForEndGame',function(){
	it('checks whether game can be end',function(){
		simran = new lib.Player("simran","10.124.132.24");
		madhuri = new lib.Player("madhuri","10.12.21.21");
		croupier = new lib.Croupier([simran,madhuri]);
		simran=croupier.players[0];
		madhuri=croupier.players[1];
		simran.hand = [{color: 'green', name: '3', action: 'simpleCard'}];
		simran.hand = [{color: 'red', name: '3', action: 'simpleCard'}];
		expect(lib.checkForEndGame(croupier.players)).to.equal(true);
		madhuri.hand = [{color: 'red', name: '4', action: 'simpleCard'}];
		expect(lib.checkForEndGame(croupier.players)).to.equal(false);
	});
});

describe('isActionCard',function(){
	it('should check whether the given card is actionCard or not',function(){
		var simple_card = {color: 'red', name: '3', action: 'simpleCard'};
		var action_card = {color: 'red', name: 'skip', action: 'skip'};
		expect(lib.isActionCard(simple_card)).to.equal(false);
		expect(lib.isActionCard(action_card)).to.equal(true);
	});
});
	
describe("getACard",function(){
	var jenny = new lib.Player("jenny","10.124.132.24");
	var jitu = new lib.Player("jitu","10.124.132.27");
	var croupier = new lib.Croupier([jenny,jitu]);
	croupier.distributeCards();
	croupier.openInitialCard();	
	croupier.players=gameInspector.apprisePlayersTurn(croupier.players);
	it("gives the player a card player does not have a card matching the top card",function(){
		var player = croupier.players[0];
		croupier.getACard();
		croupier.drawPile.should.have.length(92);
		jenny.hand.should.have.length(8);
	});
	it("gives the card from discardedPile after shuffling if the drawPile found empty",function(){
		var topCard = croupier.discardedPile[croupier.discardedPile.length-1];
		croupier.discardedPile = croupier.drawPile.splice(0,croupier.drawPile.length).concat(croupier.discardedPile);
		var player = croupier.players[0];
		croupier.getACard();
		expect(croupier.drawPile).to.have.length(91);
		expect(croupier.discardedPile).to.have.length(1);
		expect(jenny.hand).to.have.length(9);
		expect(topCard).to.equal(croupier.discardedPile[croupier.discardedPile.length-1]);
	});	
});

describe('countPoints',function(){
	var jenny = new lib.Player("jenny","10.124.132.24");
	var jitu = new lib.Player("jitu","10.124.132.27");
	var croupier = new lib.Croupier([jenny,jitu]);
	jitu.hand = [{color: 'red', name: '3', action: 'simpleCard', point:3},{color: 'red', name: '9', action: 'simpleCard', point:9}]
	jenny.hand = [{color: 'red', name: 'skip', action: 'skip', point:20},{color: 'red', name: '6', action: 'simpleCard', point:6}]
	it('should count the points of all cards in the hand of player',function(){
		croupier.countPoints();
		expect(jitu.points).to.equal(12);
		expect(jenny.points).to.equal(26);
	});
});

describe('fillDrawPile',function(){
	var dummyData= {
		discardedPile:[
			{color:"blue",name:'1',action:"simpleCard",point:1},
			{color:"blue",name:'3',action:"simpleCard",point:3},
			{color:"blue",name:'reverse',action:"reverse",point:20},
			{color:"blue",name:'4',action:"simpleCard",point:4}
		],
		drawPile:[
			{color:"blue",name:'1',action:"simpleCard",point:1},
			{color:"blue",name:'3',action:"simpleCard",point:3},
			{color:"blue",name:'reverse',action:"reverse",point:20},
			{color:"blue",name:'4',action:"simpleCard",point:4},
			{color:"blue",name:'5',action:"simpleCard",point:5},
			{color:"blue",name:'6',action:"simpleCard",point:6},
			{color:"blue",name:'7',action:"simpleCard",point:3}
		]
	}
	it("gives the card from discardedPile after shuffling if the drawPile found empty",function(){
		var topCard = dummyData.discardedPile[dummyData.discardedPile.length-1];
		lib.fillDrawPile(dummyData);
		expect(dummyData.drawPile).to.have.length(10);
		expect(dummyData.discardedPile).to.have.length(1);
		expect(topCard).to.equal(dummyData.discardedPile[0]);
	});
});

