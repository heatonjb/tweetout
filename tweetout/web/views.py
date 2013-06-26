from django.http import HttpResponse
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response
from django.views.generic import View
from django.views.decorators.http import condition
from django.conf import settings
from twython import Twython
from django.http import HttpResponseRedirect
import logging
import requests

def main(request, num="1"):
	tweets = ['1111','22222','3333']
	template_name = 'main_view.html'


	print settings.TWITTER_CONSUMER_KEY
	print settings.TWITTER_CONSUMER_SECRET
	tweets.append("Tweetout - " + settings.TWITTER_CONSUMER_KEY)

	twitter = Twython(settings.TWITTER_CONSUMER_KEY, settings.TWITTER_CONSUMER_SECRET)
	auth = twitter.get_authentication_tokens(callback_url='http://127.0.0.1:8000/auth')  #callback_url=''

	#Not final tokens, save in session later
	OAUTH_TOKEN = auth['oauth_token']
	OAUTH_TOKEN_SECRET = auth['oauth_token_secret']

	request.session['OAUTH_TOKEN'] = OAUTH_TOKEN
	request.session['OAUTH_TOKEN_SECRET'] = OAUTH_TOKEN_SECRET

	#redirect to this url
	URL = auth['auth_url']
	tweets.append(URL)

	tweets.append("AUTH.....")
	tweets.append(OAUTH_TOKEN)
	tweets.append(OAUTH_TOKEN_SECRET)

	print "********************"
	print OAUTH_TOKEN
	print OAUTH_TOKEN_SECRET

	if URL:
		return HttpResponseRedirect(URL)



	return render_to_response('main_view.html', {'tweets': tweets})
    

def auth(request, num="1"):
	log = ["auth1"]
	OAUTH_VERIFIER = request.GET['oauth_verifier']
	log.append("Oauth = " + OAUTH_VERIFIER)

	logging.debug('Debug Message')
	logging.debug(OAUTH_VERIFIER)

	twitter = Twython(	settings.TWITTER_CONSUMER_KEY, 
					settings.TWITTER_CONSUMER_SECRET,
             		request.session['OAUTH_TOKEN'], 
             		request.session['OAUTH_TOKEN_SECRET']
             	)

	final_step = twitter.get_authorized_tokens(OAUTH_VERIFIER)
	logging.debug(final_step)

	OAUTH_TOKEN = final_step['oauth_token']
	OAUTH_TOKEN_SECERT = final_step['oauth_token_secret']
	request.session['OAUTH_TOKEN'] = OAUTH_TOKEN
	request.session['OAUTH_TOKEN_SECRET'] = OAUTH_TOKEN_SECERT

	logging.debug("GOOD TO GO")
	if OAUTH_TOKEN:
		return HttpResponseRedirect("/view")

	return render_to_response('auth.html', {'log': log})

        
def view(request, num="1"):

	twitter = Twython(	settings.TWITTER_CONSUMER_KEY, 
					settings.TWITTER_CONSUMER_SECRET,
             		request.session['OAUTH_TOKEN'], 
             		request.session['OAUTH_TOKEN_SECRET']
             	)

	timeline = twitter.get_home_timeline(count=5)

	tweetText = timeline[0]['text']
	tweetText = "yes this works"

	payload = {'speech': tweetText}
	r = requests.get("http://speech.jtalkplugin.com/api/", params=payload)
	logging.error(r.url)
	logging.error(r.text)
	data = r.json()
	logging.error("JSON")
	logging.error(data)
	logging.error(data['data']['url'])

	tts = [data['data']['url']]
	logging.error(tts)
	logging.debug(timeline)

	return render_to_response('view.html', {'tweets': timeline,'ttss': tts})

	
