# Review Orchestrator Service

The Review Orchestrator is a microservice that coordinates review workflows and integrates with RabbitMQ messaging for the ClearSky educational SaaS platform.

## Overview

- **Port:** 3000
- **Purpose:** Orchestrates review request workflows and handles messaging between services
- **Dependencies:** RabbitMQ, Review Service
- **Health Check:** Built-in Docker health monitoring

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Access to RabbitMQ instance
- Access to Review Service

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Service port | `3000` |
| `RABBITMQ_URL` | RabbitMQ connection URL | Required |
| `REVIEW_SERVICE_URL` | Review Service base URL | `http://review-service:8400` |

## Running with Docker

### Using Docker Compose (Recommended)

```bash
# Set required environment variables
export RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
export REVIEW_SERVICE_URL=http://review-service:8400

# Start the service
docker-compose up -d
```

### Using Docker directly

```bash
docker build -t review-orchestrator .
docker run -p 3000:3000 \
  -e RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672 \
  -e REVIEW_SERVICE_URL=http://review-service:8400 \
  review-orchestrator
```

## Running Locally

```bash
# Install dependencies
npm install

# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node server.js` | Start in production mode |
| `dev` | `nodemon server.js` | Start with auto-reload |
| `test` | `jest` | Run tests |
| `lint` | `eslint .` | Run linting |
| `docker:build` | `docker build -t review-orchestrator .` | Build Docker image |
| `docker:run` | `docker run -p 3000:3000 review-orchestrator` | Run Docker container |

## Health Check

The service includes a built-in health check accessible at:

- **Endpoint:** `GET /health`
- **Success Response:** `200 OK` with `{ "status": "ok" }`
- **Docker Health Check:** Updates every 30 seconds with 10s timeout

### Manual Health Check

```bash
curl http://localhost:3000/health
```

## Docker Configuration

### Health Check Settings

- **Interval:** 30 seconds
- **Timeout:** 10 seconds  
- **Retries:** 3 attempts
- **Start Period:** 40 seconds (grace period on startup)

### Network Configuration

- Uses external `clearsky-network` bridge network
- Ensure the network exists: `docker network create clearsky-network`

## Dependencies

### Production Dependencies

- **express** (^4.18.2): Web framework
- **axios** (^1.6.0): HTTP client for service communication
- **amqplib** (^0.10.3): RabbitMQ client library
- **cors** (^2.8.5): Cross-origin resource sharing
- **helmet** (^7.1.0): Security middleware

### Development Dependencies

- **nodemon** (^3.0.1): Development auto-reload
- **eslint** (^8.50.0): Code linting
- **jest** (^29.7.0): Testing framework

## Troubleshooting

### Service Won't Start

1. **Check environment variables:**
   ```bash
   echo $RABBITMQ_URL
   echo $REVIEW_SERVICE_URL
   ```

2. **Verify network connectivity:**
   ```bash
   docker network ls | grep clearsky-network
   ```

3. **Check service logs:**
   ```bash
   docker-compose logs review-orchestrator
   ```

### Health Check Failures

- Ensure the service is listening on the correct port
- Verify no firewall blocking port 3000
- Check if the `/health` endpoint is implemented in `server.js`

### RabbitMQ Connection Issues

- Verify RabbitMQ is running and accessible
- Check RABBITMQ_URL format: `amqp://username:password@host:port`
- Ensure RabbitMQ service is on the same network

## File Structure

```
review_orchestrator/
├── server.js              # Main application entry point
├── healthcheck.js          # Docker health check script
├── package.json           # NPM configuration
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Docker build instructions
├── .dockerignore          # Docker ignore patterns
└── README.md              # This file
```

## License

MIT