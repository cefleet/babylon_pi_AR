Game.Ajax = function(u,f){
	var x=window.XMLHttpRequest?new XMLHttpRequest():new ActiveXObject('Microsoft.XMLHTTP');
	x.onreadystatechange=function(){
    	if(x.readyState==4&&x.status==200){
    		if(x.responseText){
    			console.log('I Should have a callback here')
    			console.log(x.responseText)
    		}
    	}
   	};
    x.open('GET',u,true);
    x.send(null) 
}
