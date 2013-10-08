import mq
import json
from mq import Producer, Consumer


def message_callback(message):
	print 'message_Callback: %s' % message


print "MQ GET TESTER"

mq = mq.MQ()
mq.init_consumer(message_callback)
print "******"
mq.consumer.wait()
#t = mq.consumer.get()

print "END MQ GET"

