# NTUA ECE SAAS 2025 PROJECT

## TEAM (27)

# ClearSky – Student Grade Evaluation Platform 

ClearSky is a full-stack web application for managing and analyzing student grades within academic institutions. It supports uploading grades via Excel, visualizing statistics, reviewing grading requests, and authenticating via Google OAuth. The platform follows a microservice architecture for scalability and modularity.

---

## Tech Stack

### Frontend
- `HTML`, `JavaScript`, `CSS`
- `react-query`, `axios`, `chart.js`, `react-router-dom`

### Backend (Orchestrators)
- **Node.js** with `express.js`
- `axios`, `formidable`, `amqplib` (RabbitMQ), `multer`
- Auth via Google OAuth2

### Microservices
- `user-management-service`: Manages users & course registrations (MongoDB)
- `user-auth-service`: Manages user authentication (MongoDB)
- `grade-service`: Parses and stores grades from Excel files (MongoDB)
- `review-service`: Review requests for grade re-evaluation (MongoDB)
- `statistics-service`: Calculates and stores statistical metrics (MongoDB)
- `institution-service`: Maintains institutions and available credits (MongoDB)
- `credit-service`: Tracks and validates credit consumption (MongoDB)
- `notification-service`: Sends email updates to users

---

## Key Features

### Authentication
- Login via **Google OAuth 2.0**
- Roles: `student`, `instructor`, `rep`

### Grade Upload (Instructor)
- Upload Excel files with initial grades
- Parses file and stores per-question & final scores
- Deducts credits based on upload

### Grade Visualization (Student)
- View your personal grade
- View course-wide statistics and distributions
- Charts per question and final grade

### Review Requests (Student & Instructor)
- Students can request grade reviews
- Instructors see and respond to pending review requests

### Statistics (All Roles)
- Automatic calculation of:
  - Average, Median, Std Dev
  - Number of Passes / Fails
  - Distribution per question
- Visualized using `chart.js` bar charts

---

## Installation & Running Locally

1. **Clone the repo**

```bash
git clone https://github.com/ntua/saas25-27.git
cd saas25-27
```

2. **Run with Docker Compose**

```bash
docker-compose up --build
```

All services will be available on their respective ports (e.g., 8081, 8100, 9000 etc.).

3. **Open the frontend**

Go to: [http://localhost](http://localhost)

---

## Testing the System

### Upload Grades

- Login as instructor
- Go to “Post Initial Grades”
- Upload Excel file with proper schema, example excels are provided by us(grades1.xlsx, grades2.xlsx,...)


### View Grades

- Login as student
- Select course
- See your personal grade, statistics, and distributions

### Review Requests

- Student submits review request
- Instructor sees it under “Review Requests” page

---

This project was developed as part of the **2025 Software as a Service (SaaS)**, NTUA, Professor: Vassilios Vescoukis.
