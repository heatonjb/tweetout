from django.http import HttpResponse
from django.template import RequestContext
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response
from django.views.generic import View
from django.views.decorators.http import condition
from django.conf import settings
from twython import Twython
from django.http import HttpResponse, HttpResponseRedirect
import logging
from web.models import User
from django.utils import simplejson
from twython import TwythonError, TwythonRateLimitError, TwythonAuthError


def main(request, num="1"):
	tweets = ['1111','22222','3333']
	template_name = 'main_view.html'


	if request.POST:

		tweets.append("Tweetout - " + settings.TWITTER_CONSUMER_KEY)

		twitter = Twython(settings.TWITTER_CONSUMER_KEY, settings.TWITTER_CONSUMER_SECRET)
		auth = twitter.get_authentication_tokens(callback_url=settings.TWITTER_CALLBACK_URL)  #callback_url=''

		#Not final tokens, save in session later
		OAUTH_TOKEN = auth['oauth_token']
		OAUTH_TOKEN_SECRET = auth['oauth_token_secret']

		request.session['OAUTH_TOKEN'] = OAUTH_TOKEN
		request.session['OAUTH_TOKEN_SECRET'] = OAUTH_TOKEN_SECRET

		#redirect to this url
		URL = auth['auth_url']
		print "********************"
		print OAUTH_TOKEN
		print OAUTH_TOKEN_SECRET

		if URL:
			return HttpResponseRedirect(URL)
	return render_to_response("main_view.html",{'tweets': tweets}, context_instance=RequestContext(request))

    

def auth(request, num="1"):
	log = ["auth1"]
	OAUTH_VERIFIER = request.GET['oauth_verifier']
	
	twitter = Twython(	settings.TWITTER_CONSUMER_KEY, 
					settings.TWITTER_CONSUMER_SECRET,
             		request.session['OAUTH_TOKEN'], 
             		request.session['OAUTH_TOKEN_SECRET']
             	)

	final_step = twitter.get_authorized_tokens(OAUTH_VERIFIER)
	
	OAUTH_TOKEN = final_step['oauth_token']
	OAUTH_TOKEN_SECERT = final_step['oauth_token_secret']
	name = final_step['screen_name']
	request.session['OAUTH_TOKEN'] = OAUTH_TOKEN
	request.session['OAUTH_TOKEN_SECRET'] = OAUTH_TOKEN_SECERT
	request.session['new'] = True
	request.session['screen_name'] = name

	user, created = User.objects.get_or_create(oauth_token=OAUTH_TOKEN, oauth_token_secret=OAUTH_TOKEN_SECERT)
	request.session['userid'] = user.id

	if OAUTH_TOKEN:
		return HttpResponseRedirect("/view")

	return render_to_response('auth.html', {'log': log})

        
def view(request, num="1"):

   	
	msg = {'success':True,'msg':""}
	tweets = []
	search = '';

	if request.POST:
		search = request.POST.get("search", "")
	
	return render_to_response("view.html",{'tweets': tweets, 'msg':msg, 'search':search}, context_instance=RequestContext(request))



def update(request):
	results = {'success':False}
	user = User.objects.get(id=request.session['userid'])
	newOnlySwitch = True if request.session['new'] else False
	streamingon = True

	if streamingon:
		results = []
		print "Streaming On......"
		newtweets = user.getStreamingTweets()
		tweets  = user.addTTS(tweets=newtweets,firstonly=True,newonly=newOnlySwitch)
		for tweet in tweets:
					results.insert(0, tweet)

	else:

		if request.method == u'GET':
			GET = request.GET 
			try:
				
				twitterAuth = user.getTwython(request.session['OAUTH_TOKEN'],request.session['OAUTH_TOKEN_SECRET'])
				if GET.get("search"):
					
					if 'last_search_tweet_id' in request.session:
						lastid = request.session['last_search_tweet_id'];
					else:
						lastid = ''
					timeline = user.getSearch(twitter=twitterAuth,count=50,since_id=lastid,searchstr=GET.get("search"))
				else:
					timeline = user.getTimeline(twitter=twitterAuth,count=50,since_id=user.last_tweet_id)
				tweets  = user.addTTS(tweets=timeline,firstonly=True,newonly=newOnlySwitch)
				results = []
				for tweet in tweets:
					results.insert(0, tweet)

			except TwythonRateLimitError, e:
				results = {'success':False,'msg':str(e)}
	
	if results == []:
		results = {'success':True,'msg':"No new Tweets available"}
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')
