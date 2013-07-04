// Gumby is ready to go
Gumby.ready(function() {
	console.log('Gumby is ready to go...', Gumby.debug());

	// placeholder polyfil
	if(Gumby.isOldie || Gumby.$dom.find('html').hasClass('ie9')) {
		$('input, textarea').placeholder();
	}
});

// Oldie document loaded
Gumby.oldie(function() {
	console.log("This is an oldie browser...");
});

// Touch devices loaded
Gumby.touch(function() {
	console.log("This is a touch enabled device...");
});


var intervalVar = '';
var playingaudio = false;

createTweet = function(item){

	var text = $('<div>').attr('class',"seven columns").html(item.text_html);
	var user = $('<div>').attr('class',"one columns").html(item.user.screen_name);
	var date = $('<div>').attr('class',"three columns").html(item.created_at);
	var img = $('<img>').attr('class',"profile_img").attr('src',item.user.profile_image_url_https);
	var inner = $('<div>').attr('class',"one columns").html(img);
	
	var newElement = $('<article>')              // Creates the element
    .attr('id',item.id) 
    .attr('data-src','https://twitter.com/'+item.user.screen_name+'/status/'+item.id_str)
    .attr('data-saytext',item.text_plain)
    .attr('class',"valign row new unread tweetrow")
    .html(inner)        
    .prependTo($("#tweetssection"));       
    
    $('#'+item.id).append(date).append(user).append(text);
 
    newElement.focus();
	newElement.removeClass('new');

	$('#'+item.id).on("click",function(event){
		openTweetLink(item.id);
	});

	
	playTweet(item.id); 
}

createTweets = function (json) {
	$.each(json, function(i, item) {
       console.log(item.text)
	   
	   setTimeout(function(){
	   		createTweet(item);
	   },1000)
	});
	
}

getUpdate = function() {

	$.getJSON("/update/", { uid:111 }, function(json){
	  //console.log(json);
	  if(json.success==false) {
	  		alert(json.msg);
	  		stopUpdating();
	  }else{
	  		if(json.msg){
	  			console.log(json.msg);
	  		}else{
	      		createTweets(json);
	      		playpause();
      		}
  	  }
  });

}

playTweet = function(id){
	tweet = $('#'+id);
	text = tweet.data('saytext');
	console.log("playing " + id + " - "  );
	console.log(tweet.data('saytext'));
	say(text);
}

say = function(text) {
	console.log('say - ' + text);
	sayText(text,1,1,3); 
}

playpause = function() {
	freezeToggle();
}

stop = function() {
	stopSpeech();
}

clear = function() {
	stopSpeech();
	setStatus(1,0);
	sayText('',3,1,3);
	setStatus(0,0);
}

stopUpdating = function() {
	intervalVar=window.clearInterval($('#intervalid').val());
	$('#stop').hide();
	$('#start').show();
	console.log("STOPPED");
}

startUpdating = function() {
	intervalVar = self.setInterval(function(){clock()},$('#interval').val());
	$('#intervalid').val(intervalVar);
	function clock()
	  {
	 		console.log("update now....");
	 		if(playingaudio == false){
	 			getUpdate();
	 		}
	  }
	$('#stop').show();
	$('#start').hide();
	console.log("STARTED");
}

openTweetLink = function(id){
	url = $("#"+id).data("src");
	console.log(url)
	window.open(url);
  	return false;
}



attachHandlers = function() {
	  $('#start').on("click",function(event){
			playpause();
	  });
	  $('#stop').on("click",function(event){
			stop();
	  });
	  
	  
}


function vw_talkStarted () {
	console.log('vw_talkStarted');
	playingaudio = true;
}

function vw_talkEnded () {
	console.log('vw_talkEnded');
	playingaudio = false;
}

//function vw_audioProgress(percent_played){
//	console.log(percent_played);
//}

function vw_apiLoaded() 
   { 
       //the API is loaded, add actions here 
       console.log('voice loaded')	;
       //turn on queuing
        setStatus(0,1);
       	//startUpdating();
   } 

 attachHandlers = function() {
	  $('#start').on("click",function(event){
			startUpdating();
	  });
	  $('#stop').on("click",function(event){
			stopUpdating();
	  });
	  
	  
}



// Document ready
$(function() {
	  attachHandlers(); 
});

