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
	    	var response = JSON.parse(data);
			window.location.href = response.newPage+'';
	    }
	});
};
var submitName=function(){
	var name = document.querySelector("#name").value;
	var requestForJoin =  'name='+name;
	postPlayerInformation(requestForJoin);
};

var checkKey = function(event){
	if(event.keyCode == '13' && document.activeElement.id != 'join')
		submitName();		
};
$(document).ready(function(){
	printForm();
	$(document).keypress(checkKey);
});
