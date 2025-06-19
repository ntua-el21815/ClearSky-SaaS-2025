import pika
import json
from dotenv import load_dotenv
import os

load_dotenv()

RABBITMQ_PASS = os.getenv('RABBITMQ_PASSWORD')


def callback(ch, method, properties, body):
    msg = json.loads(body)
    print(f"Received on {method.routing_key}: {msg}")
    ch.basic_ack(delivery_tag=method.delivery_tag)

def main():
    params = pika.ConnectionParameters(
        host='localhost', port=5672, virtual_host='/',
        credentials=pika.PlainCredentials('admin', RABBITMQ_PASS),
    )
    conn = pika.BlockingConnection(params)
    ch = conn.channel()

    queues = ['review_requests', 'review_replies', 'create_statistics', 'notifications']
    for q in queues:
        ch.basic_consume(queue=q, on_message_callback=callback)
        print(f'Started consuming {q}...')

    try:
        ch.start_consuming()
    except KeyboardInterrupt:
        print("Stopping...")
    finally:
        conn.close()

if __name__ == '__main__':
    main()