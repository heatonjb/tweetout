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
var myPlayer;

createTweet = function(item){

	var text = $('<div>').attr('class',"seven columns").html(item.text_html);
	var user = $('<div>').attr('class',"one columns").html(item.user.screen_name);
	var date = $('<div>').attr('class',"three columns").html(item.created_at);
	var img = $('<img>').attr('class',"profile_img").attr('src',item.user.profile_image_url_https);
	var inner = $('<div>').attr('class',"one columns").html(img);
	
	var newElement = $('<article>')              // Creates the element
    .attr('id',item.id) 
    .attr('data-src','https://twitter.com/'+item.user.screen_name+'/status/'+item.id_str)
    .attr('class',"valign row new tweetrow")
    .html(inner)        
    .prependTo($("#tweetssection"));       
    
    $('#'+item.id).append(date).append(user).append(text);
 
    newElement.focus();
	newElement.removeClass('new');

	$('#'+item.id).on("click",function(event){
		openTweetLink(item.id);
	});

	//var audio = { 0:{src: item.tts_url, type: 'audio/mp3'} }
	//myPlayer.setItem(audio);
	//console.log("playlist");
	//console.log(myPlayer.getPlaylist());
	sayText(item.text_plain,1,1,3); 
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
      		createTweets(json);
      		//myPlayer.setActiveItem('next');
      		//myPlayer.setPlay();
  	  }
  });

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
	 		getUpdate();
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
			startUpdating();
	  });
	  $('#stop').on("click",function(event){
			stopUpdating();
	  });
	  
	  
}


startPlayer = function() {


 // two video items we can dynamically inject for testing purposes:
var videoOne = { 0:{src: 'http://www.youtube.com/watch?v=emvpc0N0WR4', type: 'video/youtube'} }
var videoTwo = { 0:{src: 'http://www.youtube.com/watch?v=emvpc0N0WR4', type: 'video/youtube'} }

var audioOne = { 0:{src: 'http://media.tts-api.com/2aae6c35c94fcfb415dbe95f408b9ce91ee846ed.mp3', type: 'audio/mp3'} }
var audioTwo = { 0:{src: 'http://media.tts-api.com/2aae6c35c94fcfb415dbe95f408b9ce91ee846ed.mp3', type: 'audio/mp3'} }
/*********************************************************************
    Some player event listeners to set general status information:
*********************************************************************/
// triggered once mouse moves over player instance
var mouseEnterListener = function() {
    $('#mouseover').addClass('on').removeClass('off');
}
// triggered once mouse moves outside player instance
var mouseLeaveListener = function() {
    $('#mouseover').addClass('off').removeClass('on');
}
// triggered once player volume has changed
var volumeListener = function(value) {
    $('#volume').html( Math.round(value*100) + "%" )
}
// triggered whenever playhead position changes (e.g. during playback)
var timeListener = function(value) {    
    $('#time').html( value )
}
// triggered if the current media has been scaled to fit the player dims
var scaledListener = function(value) {
    $('#videodims').html( value.realWidth+" x "+value.realHeight )
    $('#playerdims').html( value.displayWidth+" x "+value.displayHeight )    
    $('#isscaled').addClass('on').removeClass('off');
}
// triggered whenever user hits a key while player instance has focus
var keyPressListener = function(value) {
    var result = value;
    switch(value) {
     case 0: result = 'SPACE'; break;
     case 9: result = 'TAB'; break;
     case 13: result = 'ENTER'; break;
     case 37: result = 'ARROW LEFT'; break;
     case 38: result = 'ARROW UP'; break;
     case 39: result = 'ARROW RIGHT'; break;
     case 40: result = 'ARROW DOWN'; break;
    
    }
    $('#key').html( result )
}
// triggered during preload promoting
var progressListener = function(value) {
    $('#progress').html( Math.round(value) + "%" )
}
// fired once the player initialized a new item and is ready
// for action?
var readyListener = function(value, ref) {
    
    // reset
    $('#isscaled').addClass('off').removeClass('on');
    
    // does it use flash?
    if (ref.getUsesFlash())
     $('#usesflash').addClass('on').removeClass('off');
    else
     $('#usesflash').addClass('off').removeClass('on');
    
    // which model in use?
    $('#model').html( ref.getModel() );
    $('#scheduleditems').html( ref.getItemCount() )
    $('#currentitem').html( ref.getItemIdx()+1 )    
    
    // the current item is the last one?
    if (ref.getIsLastItem())
     $('#islast').addClass('on').removeClass('off');
    else
     $('#islast').addClass('off').removeClass('on');
    
    // or the first one?
    if (ref.getIsFirstItem())
     $('#isfirst').addClass('on').removeClass('off');
    else
     $('#isfirst').addClass('off').removeClass('on');    
    
}    
var stateListener = function(state) {
    $('#playerstate').html(state);
    switch(state) {
     case 'PLAYING':
        $('#isplaying').addClass('on').removeClass('off');
        break;
     case 'PAUSED':
     case 'STOPPED':
        $('#isplaying').addClass('off').removeClass('on');
        break;
    }
}
var bufferListener = function(state) {
    switch(state) {
     case 'FULL':
        $('#buffer').addClass('on').removeClass('off');
        break;
     default:
        $('#buffer').addClass('off').removeClass('on');
        break;
    }
}

/*********************************************************************
Configure and instantiate the player and
apply an "onReady" callback function
*********************************************************************/
myPlayer = projekktor('#player_a', {
    debug: false,
    controls: true,
    volume: 0.5,
    height: 0,
    width: 0,
    plugin_display: {
		logoImage: "yourlogo.png"
    }
}, function(player) {
    /**
    // add listeners
    player.addListener('mouseenter', mouseEnterListener);
    player.addListener('mouseleave', mouseLeaveListener);
    player.addListener('state', stateListener);
    player.addListener('buffer', bufferListener);
    player.addListener('volume', volumeListener);
    player.addListener('time', timeListener);
    player.addListener('progress', progressListener);
    player.addListener('key', keyPressListener);    
    player.addListener('ready', readyListener);
    player.addListener('scaled', scaledListener);
    player.addListener('scheduleModified', readyListener);    
    player.addListener('item', readyListener);
    // initial values:
    
    $('#volume').html( player.getVolume()*100 + "%" )
    $('#time').html( player.getPosition() )
    $('#progress').html( player.getLoadProgress() + "%" )
    $('#videodims').html( player.getPlayerDimensions().width+"x"+player.getPlayerDimensions().height )
    $('#playerdims').html( player.getMediaDimensions().width+"x"+player.getMediaDimensions().height )
    $('#playerstate').html( player.getState() )    
    // visual environment / media support flags
    if (player.getCanPlayNatively('video/ogg')) $('#nativeogv').addClass('on').removeClass('off');
    if (player.getCanPlayNatively('video/webm')) $('#nativewebm').addClass('on').removeClass('off');
    if (player.getCanPlayNatively('video/mp4')) $('#nativemp4').addClass('on').removeClass('off');
    if (player.getCanPlayNatively('audio/mp3')) $('#nativemp3').addClass('on').removeClass('off');
    if (player.getCanPlayNatively('audio/ogg')) $('#nativeoga').addClass('on').removeClass('off');
    if (player.getIsMobileClient()) $('#ismobile').addClass('on').removeClass('off');
    
    // has flash?
    if ($p.platforms.FLASH()>0) {
     $('#hasflash').addClass('on').removeClass('off');
     $('#flashver').html("V"+$p.platforms.FLASH()+" ")
    }**/
    // player dom id
    //$('#playerid').html(player.getId());
    // Setters:
    $('#mstop').click(function(){player.setStop(); return false;})
    $('#setstopfull').click(function(){player.setStop(true); return false;})
    $('#mstart').click(function(){player.setPlay(); return false;})
    $('#mpause').click(function(){player.setPause(); return false;})

    $('#mforward').click(function(){player.setActiveItem('next'); return false;})
    $('#mbackward').click(function(){player.setActiveItem('previous'); return false;})

    /**
    $('#setseekplus').click(function(){player.setPlayhead('+5'); return false;})
    $('#setseekminus').click(function(){player.setPlayhead('-5'); return false;})
    $('#setvolumeplus').click(function(){player.setVolume('+5'); return false;})
    $('#setvolumeminus').click(function(){player.setVolume('-5'); return false;})
   
    $('#setfullscreen').click(function(){player.setFullscreen(true); return false;})    
    $('#removevideo').click(function(){player.setItem(null); return false;})
    //$('#addvideoa').click(function(){player.setItem(videoOne); return false;})
    //$('#addvideob').click(function(){player.setItem(videoTwo); return false;}) 
    **/
    //player.setItem(audioOne); 
    //player.setItem(audioTwo); 
}); 
}

function vw_talkStarted () {
	console.log('vw_talkStarted');
}

function vw_talkEnded () {
	console.log('vw_talkEnded');
}

function vw_audioProgress(percent_played){

	console.log(percent_played);
}

function vw_apiLoaded() 
   { 
       //the API is loaded, add actions here 
       console.log('voice loaded')	;
       //sayText('Hello world',1,1,3); 
       //turn on queuing
        setStatus(0,1);
       
   } 


// Document ready
$(function() {



	  attachHandlers(); 
	  //startUpdating();
	  //startPlayer();



});

