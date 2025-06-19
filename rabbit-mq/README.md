# RabbitMQ Messaging Service

This directory contains the RabbitMQ setup for the ClearSky platform, including configuration, Docker Compose deployment, and example publisher/consumer scripts.

## Overview

RabbitMQ is used as the messaging backbone for asynchronous communication between microservices. Four queues are pre-declared for different messaging scenarios:

- **review_requests**: For grade review request messages.
- **review_replies**: For replies to review requests.
- **create_statistics**: For statistics or analytics-related messages.
- **notifications**: For sending notifications to users.

## Configuration

### Queues

The following queues are automatically created on startup (see `rabbitmq_definitions.json`):

- `review_requests`
- `review_replies`
- `create_statistics`
- `notifications`

All queues are durable and reside on the default vhost `/`.

### Docker Compose

RabbitMQ is deployed using Docker Compose. The configuration mounts the queue definitions and a custom config file.

```yaml
services:
  rabbitmq:
    image: rabbitmq:3.13-management
    container_name: clearsky_rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
      - ./rabbitmq_definitions.json:/etc/rabbitmq/definitions.json
      - ./rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf
    environment:
      RABBITMQ_DEFAULT_VHOST: "/"
      RABBITMQ_LOAD_DEFINITIONS: /etc/rabbitmq/definitions.json

volumes:
  rabbitmq_data:
```

- **5672**: AMQP protocol port (for applications)
- **15672**: RabbitMQ Management UI (http://localhost:15672, default user: `guest`)

### RabbitMQ Configuration

`rabbitmq.conf`:
```
management.load_definitions = /etc/rabbitmq/definitions.json
```

This ensures the queues and permissions are loaded at startup.

## Running RabbitMQ

From this directory, run:

```sh
docker-compose up -d
```

Access the management UI at [http://localhost:15672](http://localhost:15672) (default user: `guest`, password: `guest`).

## Environment Variables

The example publisher/consumer scripts use environment variables for credentials.  
Set `RABBITMQ_PASSWORD` in your `.env` file for local testing.

---

For more details, see the example scripts and configuration files in this directory.