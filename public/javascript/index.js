var refreshData = function(){
	$.post('indexRefreshData','data=indexRefreshData',function(data,status){
		 if (status == 'success') {
	    	var response = JSON.parse(data);
		 	if(response.reachedPlayersLimit == true)
		 		window.location.href = response.url+"";
	    	else
				$('#players').html(response.data);
	    }
	});
};

var printForm = function(){
	$.get('provideIndexForm','data=provideIndexForm',function(data,status){
		 if (status == 'success') {
			$('#inputForm').html(data);
			document.querySelector('#join').onclick=submitName;
	    }
	});
};

var postPlayerInformation = function(request){
	$.post('addPlayer',request,function(data,status){
		if(status == 'success') {
			$('#players').html(data);
			var interval = setInterval(function(){
				refreshData();
			},1000);
	    }
	});
};
var i = 0;

var submitName=function(){
	var playersLimit = (document.querySelector("#noOfPlayer")) && document.querySelector("#noOfPlayer").value;
	var name = document.querySelector("#name").value;
	var requestForJoin =  'name='+name;
	var requestForLoad = 'name='+name + "&playersLimit=" + playersLimit ;
	var request = (!document.querySelector("#noOfPlayer")) &&  requestForJoin || requestForLoad;
	if((name != "" && playersLimit != "" && playersLimit<9 && playersLimit >0) || (playersLimit == null && name != "") ){
		postPlayerInformation(request)
	}else {
		alert('please enter correct entries');
	};
};

var checkKey = function(event){
	if(event.keyCode == '13' && document.activeElement.id != 'join')
		submitName();		
};
$(document).ready(function(){
	printForm();
	$(document).keypress(checkKey);
});


