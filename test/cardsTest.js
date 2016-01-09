var chai = require('chai');
var getNewDeck = require('../lib/cards.js').getNewDeck;
var should = chai.should();
var expect = chai.expect;
var assert = chai.assert;
var ld = require("lodash");

describe("getNewDeck",function(){
	var deck = getNewDeck();
	it("creates an array of cards",function(){
		deck.should.be.an("array");
	});

	it("has 108 cards",function(){
		deck.should.have.length(108);	
	});

	it("has 4 wild(plus four) cards",function(){
		var plusFourCards = deck.filter(function(card){
			return card.name=="plusFour";
		});
		plusFourCards.should.have.length(4);
	});

	describe("has skip cards",function(){
		var skipCards = deck.filter(function(card){
			return card.name=="skip";
		});
		var blueSkipCards = ld.filter(skipCards, { 'color': 'blue', 'name': "skip" });
		var greenSkipCards = ld.filter(skipCards, { 'color': 'green', 'name': "skip" });
		var redSkipCards = ld.filter(skipCards, { 'color': 'red', 'name': "skip" });
		var yellowSkipCards = ld.filter(skipCards, { 'color': 'yellow', 'name': "skip" });

			it("has 8 skip cards",function(){
				skipCards.should.have.length(8);
			});
			it("has 2 blue skip cards",function(){
				blueSkipCards.should.have.length(2);
			});
			it("has 2 green skip cards",function(){
				greenSkipCards.should.have.length(2);
			});
			it("has 2 red skip cards",function(){
				redSkipCards.should.have.length(2);
			});
			it("has 2 yellow skip cards",function(){
				yellowSkipCards.should.have.length(2);
			});
	});

	it("has 4 wild cards",function(){
		var wildCards = deck.filter(function(card){
			return card.name=="wildCard";
		});
		wildCards.should.have.length(4);
	});

	describe("has reverse cards",function(){
		var reverseCards = deck.filter(function(card){
			return card.name=="reverse";
		});
		var blueReverseCards = ld.filter(reverseCards, { 'color': 'blue', 'name': "reverse" });
		var greenReverseCards = ld.filter(reverseCards, { 'color': 'green', 'name': "reverse" });
		var redReverseCards = ld.filter(reverseCards, { 'color': 'red', 'name': "reverse" });
		var yellowReverseCards = ld.filter(reverseCards, { 'color': 'yellow', 'name': "reverse" });

			it("has 8 reverse cards",function(){
				reverseCards.should.have.length(8);
			});
			it("has 2 blue reverse cards",function(){
				blueReverseCards.should.have.length(2);
			});
			it("has 2 green reverse cards",function(){
				greenReverseCards.should.have.length(2);
			});
			it("has 2 red reverse cards",function(){
				redReverseCards.should.have.length(2);
			});
			it("has 2 yellow reverse cards",function(){
				yellowReverseCards.should.have.length(2);
			});
	});
	
	describe("has plusTwo cards",function(){
		var plusTwoCards = deck.filter(function(card){
			return card.name=="plusTwo";
		});
		var bluePlusTwoCards = ld.filter(plusTwoCards, { 'color': 'blue', 'name': "plusTwo" });
		var greenPlusTwoCards = ld.filter(plusTwoCards, { 'color': 'green', 'name': "plusTwo" });
		var redPlusTwoCards = ld.filter(plusTwoCards, { 'color': 'red', 'name': "plusTwo" });
		var yellowPlusTwoCards = ld.filter(plusTwoCards, { 'color': 'yellow', 'name': "plusTwo" });

			it("has 8 plusTwo cards",function(){
				plusTwoCards.should.have.length(8);
			});
			it("has 2 blue plusTwo cards",function(){
				bluePlusTwoCards.should.have.length(2);
			});
			it("has 2 green plusTwo cards",function(){
				greenPlusTwoCards.should.have.length(2);
			});
			it("has 2 red plusTwo cards",function(){
				redPlusTwoCards.should.have.length(2);
			});
			it("has 2 yellow plusTwo cards",function(){
				yellowPlusTwoCards.should.have.length(2);
			});
	});
	describe("Every card",function(){
		deck.every(function(card){
		 	it("is an object",function(){
		 		card.should.be.an("object");
		 	});
		 	it("has color and name properties",function(){
		 		expect(card).to.have.property('color');
		 		expect(card).to.have.property('name');

		 	});
		});
	});
});


