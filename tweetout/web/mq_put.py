import mq
import json

print "MQ PUT TESTER"

mq = mq.MQ()
mq.init_producer()

message = {'author_name': 'xxxxx',
                       'author_id': 3234234,
                       'id': 234234234,
                       'text': 'sdfdsfsdfdsf',
                       'retweeted': 'yes'
                    	}
mq.producer.publish(json.dumps(message), 'tweets')

print "Message posted to Rabbigmq"