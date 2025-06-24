# Review Service

The Review Service is a Node.js microservice for managing grade review requests in ClearSky. It provides a RESTful API for creating, retrieving, updating, and deleting review requests, and connects to MongoDB for persistent storage.

## Features

- Create a new review request
- Retrieve all reviews or filter by query parameters
- Retrieve a review by its ID
- Update a review (e.g., status, instructor response)
- Delete a review (admin only)
- Health check endpoint

## Technology Stack

- Node.js (Express)
- MongoDB (Mongoose)
- Docker & Docker Compose
- RabbitMQ (for messaging, not covered in this README)
- Environment variable configuration

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js (for local development)

### Environment Variables

Create a `.env` file in the root of the service:

```
PORT=8400
MONGO_USER=admin
MONGO_PASSWORD=yourpassword
MONGODB_URI=mongodb://admin:yourpassword@mongodb:27017/reviewDB?authSource=reviewDB
RABBITMQ_URI=amqp://rabbitmq:5672
```

### Running with Docker Compose

```sh
docker-compose up --build
```

The service will be available at `http://localhost:8400`.

## API Reference

### Base URL

```
/api/reviews
```

### Endpoints

#### Create a Review

- **POST** `/api/reviews`
- **Description:**  
  Submits a new grade review request by a student. The request must include all required fields. This endpoint is typically used by students who wish to contest or inquire about a grade.
- **Request Body:**
  ```json
  {
    "studentId": "string",                  // Unique identifier for the student
    "courseId": "string",                   // Unique identifier for the course
    "gradeId": "string",                    // Unique identifier for the grade entry
    "studentRegistrationNumber": "string",  // Registration number of the student
    "reason": "string"                      // Explanation for the review request
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "_id": "string",
    "studentId": "string",
    "courseId": "string",
    "gradeId": "string",
    "studentRegistrationNumber": "string",
    "reason": "string",
    "status": "pending",                    // Initial status
    "createdAt": "ISODate",
    "updatedAt": "ISODate"
    // ...other fields
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Missing or invalid fields in the request body.
    ```json
    { "error": "Validation failed: reason is required." }
    ```
  - `500 Internal Server Error`: Unexpected server error.
    ```json
    { "error": "Failed to create review request." }
    ```

#### Get All Reviews

- **GET** `/api/reviews`
- **Description:**  
  Retrieves a list of all review requests. Supports optional query parameters to filter reviews by student, course, status, or other fields. Useful for both students (to view their requests) and instructors/admins (to manage incoming reviews).
- **Query Parameters:** (optional)
  - `studentId`: Filter by student
  - `courseId`: Filter by course
  - `status`: Filter by review status (e.g., pending, resolved)
- **Response:** `200 OK`
  ```json
  [
    {
      "_id": "string",
      "studentId": "string",
      "courseId": "string",
      "gradeId": "string",
      "studentRegistrationNumber": "string",
      "reason": "string",
      "status": "pending",
      "createdAt": "ISODate",
      "updatedAt": "ISODate"
      // ...other fields
    }
  ]
  ```
- **Error Responses:**
  - `500 Internal Server Error`: Failed to retrieve reviews.
    ```json
    { "error": "Could not fetch reviews." }
    ```

#### Get Review by ID

- **GET** `/api/reviews/{id}`
- **Description:**  
  Retrieves the details of a specific review request by its unique ID. This endpoint is used to view the full information and status of a single review.
- **Response:** `200 OK`
  ```json
  {
    "_id": "string",
    "studentId": "string",
    "courseId": "string",
    "gradeId": "string",
    "studentRegistrationNumber": "string",
    "reason": "string",
    "status": "pending",
    "instructorResponse": "string", // If available
    "createdAt": "ISODate",
    "updatedAt": "ISODate"
    // ...other fields
  }
  ```
- **Error Responses:**
  - `404 Not Found`: No review found with the given ID.
    ```json
    { "error": "Review not found." }
    ```
  - `400 Bad Request`: Invalid ID format.
    ```json
    { "error": "Invalid review ID." }
    ```
  - `500 Internal Server Error`: Unexpected server error.
    ```json
    { "error": "Failed to retrieve review." }
    ```

#### Update a Review

- **PUT** `/api/reviews/{id}`
- **Description:**  
  Updates an existing review request. Typically used by instructors to respond to a review, change its status (e.g., to "resolved" or "rejected"), or add comments. Only allowed fields can be updated.
- **Request Body:** (fields to update, e.g., status, instructorResponse)
  ```json
  {
    "status": "resolved",
    "instructorResponse": "Your grade has been updated."
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "_id": "string",
    "studentId": "string",
    "courseId": "string",
    "gradeId": "string",
    "studentRegistrationNumber": "string",
    "reason": "string",
    "status": "resolved",
    "instructorResponse": "Your grade has been updated.",
    "createdAt": "ISODate",
    "updatedAt": "ISODate"
    // ...other fields
  }
  ```
- **Error Responses:**
  - `404 Not Found`: No review found with the given ID.
    ```json
    { "error": "Review not found." }
    ```
  - `400 Bad Request`: Invalid update fields or ID.
    ```json
    { "error": "Invalid update data." }
    ```
  - `500 Internal Server Error`: Failed to update review.
    ```json
    { "error": "Could not update review." }
    ```

#### Delete a Review

- **DELETE** `/api/reviews/{id}`
- **Description:**  
  Deletes a review request by its ID. This operation is restricted to admin users and is typically used for moderation or cleanup.
- **Response:** `200 OK`
  ```json
  { "message": "Review deleted successfully" }
  ```
- **Error Responses:**
  - `404 Not Found`: No review found with the given ID.
    ```json
    { "error": "Review not found." }
    ```
  - `403 Forbidden`: User does not have permission to delete the review.
    ```json
    { "error": "Access denied." }
    ```
  - `500 Internal Server Error`: Failed to delete review.
    ```json
    { "error": "Could not delete review." }
    ```

#### Health Check

- **GET** `/health`
- **Description:**  
  Returns a simple status message indicating that the Review Service is running and healthy. Useful for monitoring and orchestration systems.
- **Response:** `200 OK`
  ```json
  { "status": "ok" }
  ```
- **Error Responses:**
  - `500 Internal Server Error`: Service is unhealthy