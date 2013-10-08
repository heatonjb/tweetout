import logging

from amqplib import client_0_8 as amqp


import exceptions


class Consumer(object):
    def __init__(self, host, userid, password):
        """
        Constructor. Initiate connection with RabbitMQ server.
        """
        self.connection = amqp.Connection(host=host, userid=userid, password=password, virtual_host="/", insist=False)
        self.channel = self.connection.channel()

    def close(self):
        """
        Close channel and connection.
        """
        self.channel.close()
        self.connection.close()
  
    def declare_exchange(self, exchange_name, durable=True, auto_delete=False):
        """
        Create exchange.
        """
        self.exchange_name = exchange_name
        self.channel.exchange_declare(exchange=self.exchange_name,
            type='direct', durable=durable, auto_delete=auto_delete)

    def declare_queue(self, queue_name, routing_key, durable=True,
        exclusive=False, auto_delete=False):
        """
        Create a queue and bind it to the exchange.
        """
        self.queue_name = queue_name
        self.routing_key = routing_key
        #args = {{"x-max-length",2},{"x-message-ttl",300000}}
        itemlist = {'x-max-length':5000,'x-message-ttl':300000}
        args = itemlist
        #args.append(["x-max-length",2])
        #args.append(["x-message-ttl",300000])
        self.channel.queue_declare(queue=self.queue_name, durable=durable,
            exclusive=exclusive, auto_delete=auto_delete, arguments=args)
        self.channel.queue_bind(queue=self.queue_name,
            exchange=self.exchange_name, routing_key=self.routing_key,arguments=args)

    def wait(self):
        """
        Wait for activity on the channel.
        """
        print "Wait activated...."
        time = 0
        while True:
            time = time + 1
            if time > 5:
                break
            self.channel.wait()

    def add_consumer(self, callback, queue_name=None, consumer_tag='callback'):
        """
        Create a consumer and register a function to be called when
        a message is consumed
        """
        if hasattr(self, 'queue_name') or queue_name:
            self.consumer_tag = consumer_tag
            self.channel.basic_consume(
                queue=getattr(self, 'queue_name', queue_name),
                callback=callback,
                consumer_tag=consumer_tag)
            print "consumer Registered on channel."

    def del_consumer(self, consumer_tag='callback'):
        """
        Cancel a consumer.
        """
        self.channel.basic_cancel(consumer_tag)


class Producer(object):
    def __init__(self, exchange_name, host, userid, password):
        """
        Constructor. Initiate connection with the RabbitMQ server.
        """
        self.exchange_name = exchange_name
        self.connection = amqp.Connection(
            host=host, userid=userid, password=password, virtual_host="/",
            insist=False)
        self.channel = self.connection.channel()

    def publish(self, message, routing_key):
        """
        Publish message to exchange using routing key
        """
        msg = amqp.Message(message)
        msg.properties["content_type"] = "text/plain"
        msg.properties["delivery_mode"] = 2
        self.channel.basic_publish(exchange=self.exchange_name,
                         routing_key=routing_key,
                         msg=msg)
    def close(self):
        """
        Close channel and connection
        """
        self.channel.close()
        self.connection.close()


class MQ(object):
    def __init__(self):
       
        
        self.log = logging.getLogger('mq')
        self.consumer = None
        self.callback = None
        self.producer = None

    def init_consumer(self, callback):
        """Initialize a consumer to read from a queue."""
        try:
            self.consumer = Consumer(
                'theflare',
                'guest',
                'guest')
            self.consumer.declare_exchange(exchange_name='twitter')

            self.consumer.declare_queue(queue_name='tweets',
                                        routing_key='tweets')
            self.callback = callback
            self.consumer.add_consumer(self.msg_callback)
            print "Exchanges and Queues Setup"
        except amqp.AMQPException:
            self.log.error('Error configuring the consumer')
            raise exceptions.MQError()

    def init_producer(self):
        """Initialize a producer to publish messages."""
        try:
            self.producer = Producer('twitter',
                'theflare',
                'guest',
                'guest')
        except amqp.AMQPException:
            self.log.error('Error configuring the producer')
            #raise exceptions.MQError()

    def msg_callback(self, message):
        print "MSG CALL BACK HERE"
        print str(message)
        self.consumer.channel.basic_ack(message.delivery_tag)
        self.callback(message)



