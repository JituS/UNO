var changeLi = function(data){
	return '<ul>' + data.map(function(each){
		return '<b><li value='+each.id+'> Game ID --> '+each.id+'  , Players can join --> '+each.playersLimit+' , Joined Players --> '+each.players.length+'</li>';
	}) + '</ul>';
};

var printForm = function(){
	$.get('allGames',function(data,status){
		if (status == 'success') {
			data = JSON.parse(data);
			var runnig = data.filter(function(each){
				return each.gameStarted == true;
			});
			var pending = data.filter(function(each){
				return each.gameStarted == false;
			});
			$('#runnig').html(changeLi(runnig));
			$('#pending').html(changeLi(pending));
			var allGames = document.querySelectorAll('li');
			[].forEach.call(allGames,function(each){
				each.onclick = joinGame.bind(each);
			});
	    }
	});
};

var createGame = function(limit){
	$.post('createNewGame','limit='+limit,function(data,status){
		if (status == 'success') {
			$('html').html('waiting..............');
		};
	});
};

var joinGame = function(){
	$.post('joinGame','gameID='+this.value,function(data,status){
		if (status == 'success') {
			$('html').html('waiting..............');
		};
	});	
};

var startGame = function(){
	$.get('startGame',function(data,status){
		if(status == 'success') {
	    	if(data.gameStarted) window.location.href = data.url+'';
	    }
	});
};

$(document).ready(function(){
	printForm();
	var interval = setInterval(function(){
		startGame();
	},1000);
	document.querySelector('#create').onclick = function(){
		var input = $('input[name="numberOfPlayers"]');
		if(input.val() > 0 && input.val() < 8)
			createGame(input.val());
		else
			alert('Player count should be between 1 to 7');
	};
	document.querySelector('this').onclick = function(){$('#a').toggleClass('createGame')};
});