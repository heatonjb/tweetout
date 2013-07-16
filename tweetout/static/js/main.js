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
var intervalStarted = false;
var playingaudio = false;
var playlist = [];
var playlist_new = [];
var playlist_old= [];
var currentPlay;
var UserStop = false;
    
           
          


createTweet = function(item){

	    
    var header1 = '<strong class="fullname">'+ item.user.name +'</strong> ';
    var header2 = '<span class="username"> @'+ item.user.screen_name  +'+</span> ';
    var header3 = '<span class="time">'+ item.created_at +'</span>';



    var textrow = '<div class="eleven columns tweet-text">'+ item.text_html +'</div>';
    var imagerow = '<div class="one columns imagediv  "><img src="'+ item.user.profile_image_url_https + '" class="profile_img"></div>';

	var tweetheader = $('<div>').attr('class',"tweet-header").html(header1 + header2 + header3);
	var tweettext   = $('<div>').attr('class',"row tweet-content-row").html(textrow + imagerow);
	var tweetfooter = $('<div>').attr('class',"tweet-footer row").html('<div class="two columns"><div class="large success btn icon-right entypo icon-play tweet-button" id="mstart"> <a href="#" onclick="playTweet('+item.id+');"></a></div></div><div class="nine columns"></div><div class="one columns"></div>');

	var content = $('<div>').attr('class',"twelve columns tweetcontent").append(tweetheader).append(tweettext).append(tweetfooter);
	
	var newElement = $('<article>')              // Creates the element
    .attr('id',item.id) 
    .attr('data-src','https://twitter.com/'+item.user.screen_name+'/status/'+item.id_str)
    .attr('data-saytext',item.text_plain)
    .attr('class',"valign row new unread tweetrow")
    .html(content)        
    .prependTo($("#tweetssection-tweets"));       
    
     
    newElement.focus();
	newElement.removeClass('new');

	$('#'+item.id).on("click",function(event){
		openTweetLink(item.id);
	});

	
	//playTweet(item.id); 
	playlistAdd(item.id);
}

playlistPlay = function(){
	var length = playlist.length,element = null;
	console.log("userstop = " + UserStop);
	if(playlist.length > 0 && UserStop == false){
	   		
	   		if(playingaudio == false){
	   			currentPlay = playlistRemove();
	   			playTweet(currentPlay);
	   		}else{
	   			console.log("playlistplay cant play tweet as playing audio already.");
	   		}
	   
	}else{
		console.log("playlist is empty...or USERsTOP .");
		console.log("userstop = " + UserStop);
		console.log(playlist);
	}

}

playlistStop = function(){
	UserStop = true;
	stop();
}

playlistAdd = function(id) {
	playlist.push(id)
}

playlistRemove = function() {
	var id = playlist.shift();
	playlist_old.push(id);
	return id;
}



nextPlay = function(){
	playlistStop();
	UserStop = false;
	playingaudio = false;
	playlistPlay();
}

previousPlay = function(){
	playlistStop();
	playlist.unshift(playlist_old.shift());
	UserStop = false;
	playingaudio = false;
	playlistPlay();

}




createTweets = function (json) {
	$.each(json, function(i, item) {   
	   setTimeout(function(){
	   		createTweet(item);
	   },200)
	});
	
}

getUpdate = function() {

	var searchstr = encodeURIComponent($('#search').val());
	$.getJSON("/update/", { uid:111,search:searchstr }, function(json){
	  //console.log(json);
	  if(json.success==false) {
	  		alert(json.msg);
	  		stopUpdating();
	  }else{
	  		if(json.msg){
	  			console.log(json.msg);
	  		}else{
	      		createTweets(json);
	      		setTimeout(function(){
			   		playlistPlay();
			   },1000);
	      		
      		}
  	  }
  });

}

playTweet = function(id){
	tweet = $('#'+id);
	tweet.addClass('playing');
	text = tweet.data('saytext');
	console.log("play Tweet " + text);
	if($("#mute").is(':checked')){
		console.log('Cant Talk - Muted');
	}else {
		$('html, body').animate({
	         scrollTop: tweet.offset().top
	     }, 2000);
		say(text);
		playingaudio = true;
	}
}

say = function(text) {
	sayText(text,1,1,3); 
}

playpause = function() {
	freezeToggle();
}

stop = function() {
	UserStop = true;
	stopSpeech();
}

clear = function() {
	stopSpeech();
	setStatus(1,0);
	sayText('',3,1,3);
	setStatus(0,0);
}

stopUpdating = function() {
	$('#controlsheader').removeClass('loading');	
	intervalVar=window.clearInterval($('#intervalid').val());
	console.log("STOPPED");
}

startUpdating = function() {

	if($('#interval').length){
	$('#controlsheader').addClass('loading');	
	getUpdate();
	intervalVar = self.setInterval(function(){clock()},$('#interval').val());
	$('#intervalid').val(intervalVar);
	function clock()
	  {
	 		console.log("update now....");
	 		if(playingaudio == false){
	 			getUpdate();
	 		}
	  }
	console.log("STARTED");
	}
}

openTweetLink = function(id){
	url = $("#"+id).data("src");
	window.open(url);
  	return false;
}




function vw_talkStarted () {
	console.log('vw_talkStarted');
	playingaudio = true;
}

function vw_talkEnded () {
	console.log('vw_talkEnded');
	playingaudio = false;
	$('.tweetrow').removeClass('playing');
	playlistPlay();
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
       	startUpdating();
   } 

 attachHandlers = function() {
	  $('#start').on("click",function(event){
			startUpdating();
	  });
	  $('#stop').on("click",function(event){
			stopUpdating();
	  });
	  $('#stopplay').on("click",function(event){
	  	    UserStop = true;
			stop();
	  });
	  $('#startplay').on("click",function(event){
	  	    UserStop = false;
			playlistPlay();
	  });
	  $('#next').on("click",function(event){
			nextPlay();
	  });
	  $('#previous').on("click",function(event){
			previousPlay();
	  });

	  
	  
	  
}

/** MODAL WINDOWs **/

var Modals = {
 
  init: function() {
    $("<div />", {
      "class": "modal",
      "html" : 
        "<h3>About</h3>" + 
        "<p>Tweet Out reads your Tweets out loud.  If you have any suggestions, ideas, bugs please get in touch.</p>" + 
        "<p>Please tweet me at <a href='https://twitter.com/TweetOutLoud'>@TweetOutLoud</a></p>" + 
        "<br/><button class='modal-close medium warning btn'>Close</button><br/>"
    }).appendTo("body");
    
    this.bindUIActions();
  },
  
  bindUIActions: function() {
    $(".modal-button, .modal-close").on("click", function() {
      Modals.toggleModal(this);
    });   
  },
  
  toggleModal: function(button) {
  
    var modal = $(".modal");
                      
    if (modal.hasClass("show")) {
      modal
        .removeClass("show")
      
     setTimeout(function() {
        modal
          .removeClass()
          .addClass("modal");
      }, 100);
      
    } else {
      modal
        .removeClass()
        .addClass("modal " + $(button).data("modal-type"));
      
      setTimeout(function() {
        modal.addClass("show");
      }, 100);
      
    }
    
  }
  
}




// Document ready
$(function() {
	  attachHandlers(); 
	  Modals.init();
});





