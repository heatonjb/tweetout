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

	    
    var header1 = '<strong class="fullname">'+ item.user.name +'</strong> ';
    var header2 = '<span class="username"> @'+ item.user.screen_name  +'+</span> ';
    var header3 = '<small class="time"><span class="">'+ item.created_at +'</span></small> ';

	var tweetheader = $('<div>').attr('class',"tweet-header").html(header1 + header2 + header3);
	var tweettext   = $('<div>').attr('class',"tweet-text").html(item.text_html);
	var tweetfooter = $('<div>').attr('class',"tweet-footer").html('<div class="small success btn icon-right entypo icon-play" id="mstart"><a href="#" onclick="playTweet('+item.id+');"></a></div>');

	var content = $('<div>').attr('class',"eleven columns tweetcontent").append(tweetheader).append(tweettext).append(tweetfooter);


	var img = $('<img>').attr('class',"profile_img").attr('src',item.user.profile_image_url_https);
	var inner = $('<div>').attr('class',"one columns imagediv image photo").html(img);
	
	var newElement = $('<article>')              // Creates the element
    .attr('id',item.id) 
    .attr('data-src','https://twitter.com/'+item.user.screen_name+'/status/'+item.id_str)
    .attr('data-saytext',item.text_plain)
    .attr('class',"valign row new unread tweetrow")
    .html(inner)        
    .prependTo($("#tweetssection"));       
    
    $('#'+item.id).append(content);
 
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





