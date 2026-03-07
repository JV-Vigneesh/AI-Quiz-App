# 🚀 AI-Enabled Serverless Quiz Management System

A **cloud-native online quiz platform** built using **AWS Serverless Architecture and Generative AI**.
The system enables administrators to create quizzes and generate questions using AI, while users can attempt quizzes and view their scores and analytics.

This project demonstrates the integration of **ReactJS frontend with AWS backend services** including **Lambda, API Gateway, DynamoDB, Cognito, and Amplify**, along with **Google Gemini AI** for automated question generation.

---

# 📌 Project Highlights

✅ Fully **Serverless Cloud Architecture**
✅ **AI-powered question generation** using Gemini
✅ **Secure authentication** with AWS Cognito
✅ **Role-based access control** (Admin / User)
✅ **Scalable NoSQL database** with DynamoDB
✅ **CI/CD deployment** using AWS Amplify + GitHub

---

# 🏗 System Architecture

The application follows a **three-tier serverless architecture**.

```
User/Admin
     │
     ▼
AWS Cognito (Authentication)
     │
     ▼
ReactJS Frontend (Hosted on AWS Amplify)
     │
     ▼
AWS API Gateway
     │
     ▼
AWS Lambda Functions
     │
     ▼
AWS DynamoDB Database
```

🤖 **AI Module**

```
Admin → Topic Input → Gemini AI API → Generated Questions → DynamoDB
```

---

# ⚙️ Technologies Used

### Frontend

* ⚛️ ReactJS
* HTML / CSS / JavaScript
* Axios

### Backend

* ☁️ AWS Lambda (Python)
* AWS API Gateway
* AWS DynamoDB

### Authentication

* 🔐 AWS Cognito

### Deployment

* 🚀 AWS Amplify
* GitHub CI/CD

### Artificial Intelligence

* 🤖 Google Gemini API

### Development Tools

* VS Code
* Postman
* GitHub

---

# ✨ Features

## 👨‍💻 Admin Features

* Create quizzes
* Add / edit / delete questions
* Generate questions using AI
* View registered users
* View quiz results and analytics

## 👩‍🎓 User Features

* View available quizzes
* Attempt quizzes
* Submit answers
* View scores
* Track previous results

---

# 🗄 Database Design

### 📘 QuestionBank

Stores quiz questions.

| Field         | Description                |
| ------------- | -------------------------- |
| question_id   | Unique question identifier |
| question_text | Question content           |
| options       | Multiple choice options    |
| answer        | Correct answer             |

---

### 📙 Quizzes

Stores quiz metadata.

| Field        | Description       |
| ------------ | ----------------- |
| quiz_id      | Unique quiz ID    |
| title        | Quiz title        |
| topic        | Quiz topic        |
| duration     | Quiz time         |
| marks        | Total marks       |
| question_ids | Linked questions  |
| status       | Draft / Published |
| created_at   | Timestamp         |

---

### 📗 Results

Stores quiz attempt results.

| Field        | Description          |
| ------------ | -------------------- |
| result_id    | Unique result ID     |
| quiz_id      | Quiz reference       |
| user_email   | User identifier      |
| score        | Quiz score           |
| submitted_at | Submission timestamp |

---

# 🔗 API Endpoints

## 🔐 Admin APIs

```
POST   /admin/addQuestion
POST   /admin/createQuiz
GET    /admin/viewQuestions
PUT    /admin/viewQuestions
DELETE /admin/viewQuestions
GET    /admin/viewScores
GET    /admin/viewUsers
```

## 👤 User APIs

```
GET  /user/listQuizzes
GET  /user/getQuizQuestions
POST /user/submitQuiz
GET  /user/viewScore
```

---

# 📦 Project Modules

### 🧑‍💼 Admin Module

Manage quizzes, questions, users, and analytics.

### 👨‍🎓 User Module

Attempt quizzes and view results.

### 🔐 Authentication Module

Secure login using AWS Cognito and JWT tokens.

### 🤖 AI Module

Generates quiz questions using Gemini AI.

### 💾 Database Module

Stores application data in DynamoDB.

---

# 🚀 Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/JV-Vigneesh/ai-quiz-system.git
```

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

### 3️⃣ Backend Setup

Deploy Lambda functions using **AWS Console or AWS CLI**.

Configure environment variables:

```
QUESTION_TABLE
QUIZ_TABLE
USER_POOL_ID
```

---

# 🌐 Deployment

Frontend is deployed using **AWS Amplify**.

Steps:

1️⃣ Push code to GitHub
2️⃣ Connect repository to Amplify
3️⃣ Amplify builds and deploys automatically

---

# 🔒 Security Features

* JWT Authentication using Cognito
* Role-based access control
* Admin-only APIs
* CORS configuration
* Secure API endpoints
* User data isolation

---

# 🔮 Future Enhancements

* 🏆 Leaderboard and achievements
* 📱 Mobile application support
* 📜 Certificate generation
* 🌍 Multi-language support
* 📊 Advanced analytics dashboards
* 🤖 Adaptive AI-based quiz difficulty
