# Review Orchestrator Service

The Review Orchestrator is a Node.js microservice responsible for coordinating review-related workflows in the ClearSky platform. It acts as an API gateway and orchestrator between the Review Service, RabbitMQ, and other microservices. The API is documented using OpenAPI and supports robust health checking for container orchestration.

## Features

- Orchestrates review request and response flows between services
- Communicates with RabbitMQ for asynchronous messaging
- Forwards and aggregates data from the Review Service
- Provides a health check endpoint for Docker and Kubernetes
- OpenAPI (Swagger) documented REST API

## Technology Stack

- Node.js (Express)
- RabbitMQ (AMQP)
- Docker & Docker Compose
- OpenAPI (Swagger) for API documentation

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js (for local development)
- RabbitMQ and Review Service running (see `.env` and Docker Compose)

### Running the Service

```sh
docker-compose up --build
```

The orchestrator will be available at `http://localhost:3000`.

## Health Check

A health check endpoint is provided for orchestration and monitoring:

- **GET** `/health`
- **Success Response:**
  ```json
  { "status": "ok" }
  ```
- **Failure Response:**
  ```json
  { "status": "error", "details": "..." }
  ```

The included `healthcheck.js` script is used by Docker Compose to check service health.

## API Reference

The API is described by the OpenAPI specification (see `openapi.yaml` or `/api-docs` if Swagger UI is enabled).

### Example Endpoints

#### Create a Review Request

- **POST** `/api/reviews`
- **Description:** Orchestrates the creation of a new review request, forwarding the request to the Review Service and publishing a message to RabbitMQ.
- **Request Body Example:**
  ```json
  {
    "studentId": "string",
    "courseId": "string",
    "gradeId": "string",
    "studentRegistrationNumber": "string",
    "reason": "string"
  }
  ```
- **Success Response:**
  - `201 Created`
    ```json
    {
      "_id": "string",
      "status": "pending",
      // ...other fields
    }
    ```
- **Failure Responses:**
  - `400 Bad Request`
    ```json
    { "error": "Validation failed: reason is required." }
    ```
  - `500 Internal Server Error`
    ```json
    { "error": "Failed to create review request." }
    ```

#### Get All Reviews

- **GET** `/api/reviews`
- **Description:** Retrieves all review requests, possibly aggregating from multiple services.
- **Success Response:**
  - `200 OK`
    ```json
    [
      {
        "_id": "string",
        "studentId": "string",
        "courseId": "string",
        // ...
      }
    ]
    ```
- **Failure Response:**
  - `500 Internal Server Error`
    ```json
    { "error": "Could not fetch reviews." }
    ```

#### Update a Review

- **PUT** `/api/reviews/{id}`
- **Description:** Updates a review request, typically by an instructor or admin.
- **Request Body Example:**
  ```json
  {
    "status": "resolved",
    "instructorResponse": "Your grade has been updated."
  }
  ```
- **Success Response:**
  - `200 OK`
    ```json
    {
      "_id": "string",
      "status": "resolved",
      // ...other fields
    }
    ```
- **Failure Responses:**
  - `404 Not Found`
    ```json
    { "error": "Review not found." }
    ```
  - `400 Bad Request`
    ```json
    { "error": "Invalid update data." }
    ```
  - `500 Internal Server Error`
    ```json
    { "error": "Could not update review." }
    ```

#### Delete a Review

- **DELETE** `/api/reviews/{id}`
- **Description:** Deletes a review request (admin only).
- **Success Response:**
  - `200 OK`
    ```json
    { "message": "Review deleted successfully" }
    ```
- **Failure Responses:**
  - `404 Not Found`
    ```json
    { "error": "Review not found." }
    ```
  - `403 Forbidden`
    ```json
    { "error": "Access denied." }
    ```
  - `500 Internal Server Error`
    ```json
    { "error": "Could not delete review." }
    ```

## Environment Variables

- `PORT`: Port for the orchestrator (default: 3000)
- `RABBITMQ_URL`: RabbitMQ connection string
- `REVIEW_SERVICE_URL`: URL for the Review Service

## OpenAPI Documentation

For the full OpenAPI specification, see [`openapi.yaml`](./openapi.yaml) or visit `/api-docs` if Swagger UI is enabled.

---