import pika
import json
from dotenv import load_dotenv
import os

load_dotenv()

RABBITMQ_PASS = os.getenv('RABBITMQ_PASSWORD')

def main():
    params = pika.ConnectionParameters(
        host='localhost', port=5672, virtual_host='/',
        credentials=pika.PlainCredentials('admin', RABBITMQ_PASS),
    )
    conn = pika.BlockingConnection(params)
    ch = conn.channel()

    queues = ['review_requests', 'review_replies', 'create_statistics', 'notifications']
    for q in queues:
        message = {'queue': q, 'payload': f'Hello {q}!'}
        ch.basic_publish(exchange='',
                         routing_key=q,
                         body=json.dumps(message),
                         properties=pika.BasicProperties(content_type='application/json'))
        print(f'Published to {q}: {message}')

    conn.close()

if __name__ == '__main__':
    main()