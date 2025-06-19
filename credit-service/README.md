# Institution Credit Service

This service manages institution credits for the ClearSky platform. It provides RESTful APIs for querying balances, adding and using credits, viewing usage history, and purchasing credits via Stripe. The API is documented using OpenAPI and includes both successful and failed response examples.

## Technology Stack

- Node.js (Express)
- MongoDB (Mongoose)
- Stripe (for payments)
- Docker & Docker Compose
- OpenAPI (Swagger) for API documentation

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js (for local development)

### Running the Service

```sh
docker-compose up --build
```

The API will be available at `http://localhost:3000` by default.

## API Reference

The API is described by the OpenAPI specification (see `openapi.yaml` or `/api-docs` if Swagger UI is enabled).

### Base URL

```
/api/credits
```

---

### Endpoints

#### Get Institution Credit Balance

- **GET** `/api/credits/:institutionId/balance`
- **Description:** Retrieve the current credit balance for an institution.

**Success Response:**
- `200 OK`
```json
{
  "institutionId": "inst123",
  "totalCredits": 1000,
  "usedCredits": 200,
  "availableCredits": 800
}
```

**Failure Response:**
- `500 Internal Server Error`
```json
{ "message": "Internal Server Error" }
```

---

#### Add Credits to Institution

- **POST** `/api/credits/:institutionId/add`
- **Description:** Add credits to an institution's account.

**Request Body Example:**
```json
{ "creditsToAdd": 500 }
```

**Success Response:**
- `200 OK`
```json
{
  "institutionId": "inst123",
  "totalCredits": 1500,
  "usedCredits": 200,
  "availableCredits": 1300,
  "creditsAdded": 500
}
```

**Failure Responses:**
- `400 Bad Request`
```json
{ "message": "creditsToAdd must be a positive number" }
```
- `500 Internal Server Error`
```json
{ "message": "Internal Server Error" }
```

---

#### Use Credits

- **POST** `/api/credits/:institutionId/use`
- **Description:** Deduct credits from an institution for a specific operation.

**Request Body Example:**
```json
{
  "creditsToUse": 50,
  "operation": "create_course",
  "courseId": "course456"
}
```

**Success Response:**
- `200 OK`
```json
{
  "institutionId": "inst123",
  "totalCredits": 1500,
  "usedCredits": 250,
  "availableCredits": 1250,
  "creditsUsed": 50
}
```

**Failure Responses:**
- `400 Bad Request`
```json
{ "message": "Insufficient credits" }
```
- `404 Not Found`
```json
{ "message": "No credits found for institution" }
```
- `500 Internal Server Error`
```json
{ "message": "Internal Server Error" }
```

---

#### Get Credit Usage History

- **GET** `/api/credits/:institutionId/history`
- **Description:** Retrieve the credit usage history for an institution.

**Success Response:**
- `200 OK`
```json
[
  {
    "institutionId": "inst123",
    "creditsUsed": 50,
    "operation": "create_course",
    "courseId": "course456",
    "usedAt": "2024-06-01T12:00:00.000Z"
  }
]
```

**Failure Response:**
- `500 Internal Server Error`
```json
{ "message": "Internal Server Error" }
```

---

#### Purchase Credits (Stripe Payment Simulation)

- **POST** `/api/credits/:institutionId/purchase`
- **Description:** Simulate a Stripe payment to purchase credits for an institution.

**Request Body Example:**
```json
{ "numOfCredits": 100 }
```

**Success Response:**
- `200 OK`
```json
{
  "transactionId": "txn_abc123",
  "institutionId": "inst123",
  "numOfCredits": 100,
  "status": "COMPLETED",
  "creditBalance": 1400,
  "reasonForDecline": null
}
```

**Failure Responses:**
- `402 Payment Required`
```json
{
  "transactionId": "txn_abc124",
  "institutionId": "inst123",
  "numOfCredits": 100,
  "status": "FAILED",
  "creditBalance": 1300,
  "reasonForDecline": "Your card has insufficient funds."
}
```
- `500 Internal Server Error`
```json
{ "message": "Internal Server Error" }
```

---

#### Health Check

- **GET** `/health`
- **Description:** Check if the service is running.

**Success Response:**
- `200 OK`
```json
{ "status": "healthy" }
```

---

## OpenAPI Documentation

For the full OpenAPI specification, see [`openapi.yaml`](./openapi.yaml) or visit `/api-docs` if Swagger UI is enabled.