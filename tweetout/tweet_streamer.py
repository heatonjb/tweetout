#!/usr/bin/python
# -*- coding: utf-8 -*-

import logging
import time
import json
import sys
from twython import Twython
from twython import TwythonStreamer
from datetime import datetime, timedelta
from email.utils import parsedate_tz

import config
#import data

from daemon import Daemon
import mq

class Tweets(Daemon):
    """
    Tweets main class
    """
    def __init__(self, pid_file):
        """
        Constructor
        """
        logging.basicConfig(filename='log_tweets.txt',level=logging.DEBUG)
        Daemon.__init__(self, pid_file)
        self.db = None
        print "constructor"
        #c = config.Config()
        #self.config = c.cfg
    
    def setup(self):
        """
        Setup DB connections, message queue producer and the Twitter stream
        listener.
        """ 
        print "setup daemon here....."
        #self.setup_db()
        self.setup_mq()
        self.setup_stream_listener()

    def setup_db(self):
        # setup db connections
        self.db = db.Db()
        self.db.setup()
        # get latest persons list
        self.persons = self.db.get_persons()

    def setup_mq(self):
        self.mq = mq.MQ()
        self.mq.init_producer()

    def setup_stream_listener(self):
        """
        Setup Twitter API streaming listenner
        """
        print "setup stream listener"

        TWITTER_CONSUMER_KEY = 'UXGPhu7Mxmb7UrGskHnofg'
        TWITTER_CONSUMER_SECRET = 'OFUKyMZXvOSwcFyyXKJYbwrLqdYICpflrOZAuaNVvs'
        OAUTH_TOKEN = '66629521-mU8uNJS2SWjqZ7LZ6DVKhipqd6HtEMIszZD1P40Fn'
        OAUTH_TOKEN_SECRET = '3p2iurE9Xn4aaHz65AUYrFsrg2Rf5vA4rljCYRNYg'
        self.stream = Listener( 
                            TWITTER_CONSUMER_KEY, 
                            TWITTER_CONSUMER_SECRET,
                            OAUTH_TOKEN, 
                            OAUTH_TOKEN_SECRET
                            )

        self.stream.set_tweets(self)
       
        #Use this to stream users timeline
        #self.stream.user()

        

    def run(self):
        print "run...."
        self.setup()
        self.stream_filter()

    def stream_filter(self):
        """
        Start listening based on a list of persons names.
        """

        track_list = ['heatonjb2','jeanography','burger']
        follow_list = [1553592488,557672619,66629521]
        print track_list

        
        logging.debug('track_list: %s', track_list)
        self.stream.statuses.filter(track=track_list)
        #while True:
        try:
            #self.stream.statuses.filter(follow=follow_list)
            #self.stream.statuses.filter(track=track_list)
            pass
        except Exception:
            print "****** EXCEPTION STREAM FILTER"
            e = sys.exc_info()[0]
            print e
            logging.exception('stream filter exception **********')
            logging.exception(e)
            time.sleep(10)
        
        # add names to stream filter
        #track_list = [data.normalize(p['name']) for p in self.persons]
        logging.debug('track_list: %s', track_list)
        #while True:
            #try:
                #self.stream.filter(track=track_list)
            #except Exception:
                #logging.exception('stream filter')
                #time.sleep(10)


class Listener(TwythonStreamer):
    """
    Twitter Streaming API listener
    """

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
                if elapsed > timedelta(minutes=5):
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
            #   r = requests.get("http://speech.jtalkplugin.com/api/", params=payload)
            #   data = r.json()
            #   tweet['tts_url'] = [data['data']['url']]

            if first==True:
                if timeline:
                    self.last_tweet_id = tweet['id']
                    self.save()
                else:
                    request.session['last_search_tweet_id'] = tweet['id'];
                first = False
                
        return tweets

    def on_success(self, data):
        if 'text' in data:
            print data['text'].encode('utf-8')
            print data['user']['screen_name'] + " | " +  str(data['user']['id'])
            logging.debug(data['text'])
            
            message = json.dumps(data)
            tweets  = self.addTTS(tweets=message,firstonly=True,newonly=True)

            logging.debug(message)
            self.tweets.mq.producer.publish(tweets, 'tweets')
        else:
            print "No Tweet return message......"
            print data


    def on_status(self, status):
        """
        Callback when post is received ok
        """
        logging.debug('on status: %s', status)

    def on_disconnect(self, status):
        """
        on_disconnect
        """
        print 'disconnected!'
        logging.debug('on status: %s', status)
    
    def on_error(self, status_code, data):
        """
        Callback when there is an error on the stream
        """
        logging.debug('error: %s', status_code)

    def on_timeout(self):
        """
        Callback when there is a timeout on the stream
        """
        logging.debug('timeout')
        
    def on_limit(self, data):
        """Called when a limitation notice arrives"""
        print " on limit msg...."
        logging.debug('limit: %s', data)
        return

    def on_delete(self, status_id, user_id):
         """Called when a delete notice arrives for a status"""
         logging.debug('delete: %s - %s', status_id, user_id)
         return

    def set_tweets(self, t):
        """
        Set Tweets class object
        """
        self.tweets = t

if __name__ == "__main__":
    daemon = Tweets('/tmp/tweets.pid')
    if len(sys.argv) == 2:
        if 'start' == sys.argv[1]:
            daemon.start()
        elif 'stop' == sys.argv[1]:
            daemon.stop()
        elif 'restart' == sys.argv[1]:
            daemon.restart()
        else:
            print "Unknown command"
            sys.exit(2)
        sys.exit(0)
    else:
        print "usage: %s start|stop|restart" % sys.argv[0]
        sys.exit(2)