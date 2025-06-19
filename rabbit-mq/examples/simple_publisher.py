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

    payload_req = {
        "type" : "request",
        "data" : {
            "id": 123,
            "content": "This is a test message"
        }
    }

    payload_rep = {
        "type": "reply",
        "data": {
            "id": 123,
            "status": "processed"
        }
    }

    payload_stats = {
        "type": "statistics",
        "data": {
            "total_requests": 100,
            "successful_requests": 95
        }
    }

    payload_notif = {
        "type": "notification",
        "data": {
            "user_id": 456,
            "message": "You have succesfully registered!"
        }
    }

    payloads = [payload_req, payload_rep, payload_stats, payload_notif]

    queues = ['review_requests', 'review_replies', 'create_statistics', 'notifications']
    for i, q in enumerate(queues):
        message = payloads[i]     
        ch.basic_publish(exchange='',
                         routing_key=q,
                         body=json.dumps(message),
                         properties=pika.BasicProperties(content_type='application/json'))
        print(f'Published to {q}: {message}')

    conn.close()

if __name__ == '__main__':
    main()