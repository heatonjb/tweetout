print "MQ Put"
import mq
from mq import Producer, Consumer
import json


def message_callback(message):
	print 'message_Callback: %s' % message


print "MQ PUT TESTER"

mq = mq.MQ()
mq.init_consumer(message_callback)
mq.init_producer()

message = {'author_name': 'xxxxx',
                       'author_id': 3234234,
                       'id': 234234234,
                       'text': 'sdfdsfsdfdsf',
                       'retweeted': 'yes'
                    	}
mq.producer.publish(json.dumps(message), 'tweets')

print "END MQ PUT"

