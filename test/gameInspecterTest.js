var chai = require('chai');
var lib = require('../lib/croupier.js').lib;
var getNewDeck = require('../lib/cards.js').getNewDeck;
var should = chai.should();
var expect = chai.expect;
var assert = chai.assert;
var ld = require("lodash");
var gameInspector = require('../lib/gameInspector.js').gameInspector;

describe("gameInspector",function(){
	var croupier,simran,madhuri,dataForCardAction;
	beforeEach(function(){
		simran = new lib.Player("simran","10.124.132.24");
		madhuri = new lib.Player("madhuri","10.12.21.21");
		croupier = new lib.Croupier([simran,madhuri]);
		lib.shuffleCards();
		croupier.distributeCards();
		croupier.openInitialCard();
		simran=croupier.players[0];
		madhuri=croupier.players[1];
		croupier.players[0].myTurn = true;
		dataForCardAction={
			players : croupier.players,
			drawPile : croupier.drawPile,
			discardedPile : croupier.discardedPile,
		}
	});

	it("it is an object which tells the croupier its action in different circumstances",function(){
		expect(gameInspector).to.be.a("object");
	});
	it("it has different methods",function(){
		expect(gameInspector.throwCard).to.be.a("function");
		expect(gameInspector.pickCard).to.be.a("function");
		expect(gameInspector.skip).to.be.a("function");
		expect(gameInspector.reverse).to.be.a("function");
		expect(gameInspector.wildCard).to.be.a("function");
		expect(gameInspector.plusFour).to.be.a("function");
		expect(gameInspector.plusTwo).to.be.a("function");
	});
	describe("has method `throwCard` ",function(){
		it("update player's hand whose turn is true and add the thrown card to discardedPile",function(){			
			var cardToBeThrown={name:"5",color:"red",action:"simpleCard"};
			dataForCardAction.players[0].hand=[
			{name:"1",color:"red",action:"simpleCard"},
			{name:"2",color:"red",action:"simpleCard"},
			{name:"3",color:"red",action:"simpleCard"},
			{name:"4",color:"red",action:"simpleCard"},
			{name:"5",color:"red",action:"simpleCard"},
			{name:"6",color:"red",action:"simpleCard"},
			{name:"7",color:"red",action:"simpleCard"}
			];
			dataForCardAction.cardToBeThrown=cardToBeThrown;
			var throwCard = gameInspector.throwCard(dataForCardAction); 
			expect(throwCard).to.be.a("object");
			expect(throwCard).to.have.all.keys("players","drawPile","discardedPile");
			expect(throwCard.players[0].hand).to.have.length(6);
			expect(throwCard.players[0].hand).not.to.have.property(cardToBeThrown);
			expect(throwCard.discardedPile).to.have.length(2);
			expect(throwCard.discardedPile[1]).to.deep.equal(cardToBeThrown);
		});
	});
	describe("has method `pick Card` ",function(){
		it("update player's hand whose turn is true and removes the number of cards from the drawPile",function(){
			dataForCardAction.noOfCards=2;			
			var pickCard=gameInspector.pickCard(dataForCardAction);
			expect(pickCard).to.be.a("object");
			expect(pickCard).to.have.all.keys("players","drawPile","discardedPile");
			expect(pickCard.players[0].hand).to.have.length(9);
			expect(pickCard.drawPile).to.have.length(91);
		});
	});

	describe("has method `plusFour` ",function(){
		it("removes 4 cards from the drawPile and add those to the players hand and return the gameData",function(){
			dataForCardAction.color="blue";
			var plusFour=gameInspector.plusFour(dataForCardAction);
			expect(plusFour).to.be.a("object");
			expect(plusFour).to.have.all.keys("players","drawPile","discardedPile");
			expect(plusFour.players[0].hand).to.have.length(11);
			expect(plusFour.drawPile).to.have.length(89);
			expect(plusFour.discardedPile[plusFour.discardedPile.length-1].color).is.equal("blue");
		});
	});
	describe("has method `skip`",function(){
		var jitu = new lib.Player("jitu","10.9.21.21");
		it("skip the next person and changes the myTurn property of the alternate person to true",function(){
			croupier.players.push(jitu);
			var skipedOnce=gameInspector.skip(dataForCardAction);
			expect(skipedOnce).to.be.a("object");
			expect(skipedOnce).to.have.all.keys("players","drawPile","discardedPile");
			expect(skipedOnce.players[1].myTurn).to.equal(true);
			var skipedTwice=gameInspector.skip(dataForCardAction);
			expect(skipedTwice.players[2].myTurn).to.equal(true);
		});	
	});

	describe("has method `reverse` ",function(){
		it("reverse the order of playing game between players",function(){
			var reverse=gameInspector.reverse(dataForCardAction);
			expect(reverse.players).to.deep.equal(dataForCardAction.players.reverse());
			expect(reverse.players)
		});
	});
	describe("has method `wildCard` ",function(){
		it("changes the color of the top card in discardedPile to the given color",function(){
			dataForCardAction.color="blue";
			var wildCard=gameInspector.wildCard(dataForCardAction);
			expect(wildCard).to.be.a("object");
			expect(wildCard.players[0].hand).to.have.length(7);
			expect(wildCard.drawPile).to.have.length(93);
			expect(wildCard.discardedPile[wildCard.discardedPile.length-1].color).is.equal("blue");
		});
	});
});
