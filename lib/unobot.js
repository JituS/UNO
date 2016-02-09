var page = require('webpage').create();
var system = require('system');
var args = system.args;

page.onConsoleMessage = function(msg){
    console.log(msg);
}

page.onLoadFinished = function(status){
    if(page.url == 'http://127.0.0.1:8080/allGame.html'){
        chooseGame(page);
    }
    if(page.url == 'http://127.0.0.1:8080/gamePage.html'){
        play(page);
    }
};

var play = function(page){
    var winner = page.evaluate(function(){
        if(document.querySelector('#restart') != null){
            return document.querySelector('#first').innerHTML;
        }
        var playAbleCard = function(card, discard){
            card = JSON.parse(card);
            discard = JSON.parse(discard);
            if(card.color == discard.color || card.name == discard.name){
                return true;
            }
            return false;
        };
        var cards = null;
        var showTurn = null;
        var discard = null;
        var changeTurn = null;
        var ok = null;
        var drawCard = null
        while(!cards && !showTurn && !discard && !changeTurn && !ok){
            cards = document.querySelectorAll('#hand td');
            showTurn = document.querySelector('#showTurn');
            discard = document.querySelector('#discardPile table tr td');
            changeTurn = document.querySelector('#changeTurn');
            ok = document.querySelector('#OK');
            drawCard = document.querySelector('.drawPile');
        }
        for(var i = 0; i < cards.length; i++){
            if(playAbleCard(cards[i].getAttribute('value'), discard.getAttribute('value'))){
                cards[i].click()
                return;
            }
            if(cards[i].name == 'wildCard' || cards[i].name == 'plusFour'){    
                cards[i].click();
                ok.click();
                return;
            }
        }
        setTimeout(function(drawCard){
            drawCard.click()
            return;
        },500, drawCard);
        setTimeout(function(changeTurn){
            changeTurn.click()
            return;
        },1000, changeTurn);
    }); 
    if(winner){console.log(winner + ' Wins'); phantom.exit()}
    page.render('a.jpg');
    setTimeout(play, 2000, page);
};

var chooseGame = function(page){
    console.log('chooseGame', page.url)
    page.evaluate(function(){
        var li = null;
        while(!li){
            li = document.querySelector('li');
        }
        li.click();
    });
};

page.open('http://127.0.0.1:8080/index.html', function(status) {
    var url = page.url;
    if(status == 'success'){
        page.evaluate(function(name){
            var input = null;
            var button = null;
            while(!input && !button){
                input = document.querySelector('input[name=name]');
                button = document.querySelector('button');
            };
            input.value = name;
            button.click();
        }, args[1]);
    }    
});
