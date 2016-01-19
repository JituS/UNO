var ld = require ('lodash');

var createSimpleCard = function(color,cards,all_cards){
	cards.forEach(function(each_card){
		var card    = {};
		card.color  = color;
		card.name   = each_card;
		card.action =  +each_card && 'simpleCard';
		card.point  = +each_card;
		card.point  = (!card.point && card.point != 0) ? 20 : +each_card;
		card.action = (!card.action && card.action != '0') ? each_card : 'simpleCard';
		(each_card == '0') 
		? all_cards.push(card)
		: all_cards.push(card,card);
	});
	return all_cards;
}


var createWildCard =function(wildCards,all_cards){
	wildCards.forEach(function(card){
		var wildCard    = {};
		wildCard.color  = null;
		wildCard.name   = card;
		wildCard.action = card;
		wildCard.point  = 40;
		all_cards.push(wildCard);
	});
	return all_cards;
};


exports.getNewDeck = function(){
	var colors = ['green','blue','yellow','red'];
	var cards = ['0','1','2','3','4','5','6','7','8','9','reverse','plusTwo','skip'];
	var wild_cards = ["plusFour","wildCard"];
	var all_cards = [];
	colors.forEach(function(color) {
		createSimpleCard(color,cards,all_cards);
		createWildCard(wild_cards,all_cards);
	});
	return all_cards;
};
