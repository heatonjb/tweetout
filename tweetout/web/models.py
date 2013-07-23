from django.db import models
from twython import Twython
from django.conf import settings
from datetime import datetime, timedelta
from email.utils import parsedate_tz
from twython import TwythonError, TwythonRateLimitError, TwythonAuthError
import re

import requests

class User(models.Model):
	oauth_token = models.CharField(max_length=90)
	oauth_token_secret = models.CharField(max_length=90)
	last_tweet_id = models.IntegerField(null=True,blank=True)
	read_only_latest_tweet = models.BooleanField(default=True)
	def getTwython(self,token,secret):
		twitter = Twython(	settings.TWITTER_CONSUMER_KEY, 
					settings.TWITTER_CONSUMER_SECRET,
             		token, 
             		secret
             	)
		return twitter

	def to_datetime(self,datestring):
		try:
			time_tuple = parsedate_tz(datestring.strip())
			dt = datetime(*time_tuple[:6])
			dt - timedelta(seconds=time_tuple[-1])
		except Exception, e:
			datestring = "18 Feb 2007 16:30:00"
			time_tuple = parsedate_tz(datestring.strip())
			dt = datetime(*time_tuple[:6])
			dt - timedelta(seconds=time_tuple[-1])
		
		return dt

	def getTimeline(self,twitter,count=50,since_id=1):
		
		timeline = twitter.get_home_timeline(count=50,since_id=self.last_tweet_id,trim_user=False,contributor_details=True)
	
		return timeline

	def getSearch(self,twitter,searchstr,count=50,since_id=1):
		
		search = twitter.search(count=50,since_id=self.last_tweet_id,q=searchstr)
	
		return search

	def cleanTweet(self,tweet):
		line = ' '.join(re.sub("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)"," ",tweet).split())
		return line

	def addHTMLtoTweet(self,tweet):
		tweeter  = re.sub('(@[A-Za-z0-9]+)', '', tweet)
		return tweeter

	def addTTS(self,tweets,firstonly=True,timeline=True,newonly=False):
		
		try:
			tweets = tweets['statuses']
		except Exception, e:
			pass

		GMTNow = datetime.today() - timedelta(hours = 1)

		
		GMTNowMin = (datetime.today() - timedelta(hours = 1)) - timedelta(minutes = 1)

		first = True
		for tweet in tweets:
			tweet['text_html'] = self.addHTMLtoTweet( tweet['text'] )
			
			created_at = self.to_datetime(tweet['created_at'])
			elapsed =  GMTNow - created_at
			tweet['created_at'] = created_at.strftime('%d %b %Y %H:%M:%S')
			
			if newonly:
				if elapsed > timedelta(minutes=2):
					tweet['autoplay'] =  False;
				else:
					tweet['autoplay'] =  True;
			else:
				tweet['autoplay'] =  True;

			tweet['tts_url'] = ''
			plain = self.cleanTweet(tweet['user']['name'] + ' . ' + tweet['text'])
			payload = {'speech': plain }
			tweet['text_plain'] =  plain;
			tweet['text_tts'] =  payload;
			
	
			#tweet['tts_url'] = requests.get("http://tts-api.com/tts.mp3?return_url=1&q=", params=payload)
			#r = requests.get("http://speech.jtalkplugin.com/api/", params=payload)
			#data = r.json()
			#tweet['tts_url'] = [data['data']['url']]
			#if firstonly:
			#	r = requests.get("http://speech.jtalkplugin.com/api/", params=payload)
			#	data = r.json()
			#	tweet['tts_url'] = [data['data']['url']]

			if first==True:
				if timeline:
					self.last_tweet_id = tweet['id']
					self.save()
				else:
					request.session['last_search_tweet_id'] = tweet['id'];
				first = False
				
		return tweets

