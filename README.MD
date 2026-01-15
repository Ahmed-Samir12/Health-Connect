# Node.js REST API Starter

A clean, scalable Node.js REST API starter template built for portfolio and real-world projects.

This project provides a solid foundation with best practices for structure, error handling, and configuration so you can focus on business logic instead of boilerplate.

---

## 🚀 Features

- Express.js REST API
- Clean & scalable folder structure
- Global error handling
- Async error wrapper (no repetitive try/catch)
- Environment-based configuration
- MongoDB & Mongoose ready
- Security middlewares (Helmet)
- Developer-friendly logging
- Ready-to-use project template

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (ready to be added)
- ESLint & Prettier

---

## 📁 Project Structure

```
src/
├── app.js # Express app configuration
├── server.js # Server & database bootstrap
├── config/ # Environment & DB config
├── controllers/ # Route controllers
├── routes/ # API routes
├── models/ # Mongoose models
├── middlewares/ # Custom middlewares
├── utils/ # Utility classes & helpers
│ ├── AppError.js # Custom error class
│ └── catchAsync.js # Async error wrapper
```
---------------------------------------------------

## ⚙️ Environment Variables

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=development
PORT=3000
DATABASE=mongodb://127.0.0.1:27017/project-name
```

▶️ Getting Started
1️⃣ Install dependencies
```
npm install
```

2️⃣ Run in development mode
```
npm run dev
```

3️⃣ Health check
```
GET /api/v1/health
```

Response:
```
{
  "status": "OK"
}
```
-----------------------------------------------------
## 🧠 Error Handling

This project uses a centralized global error handler.

Operational errors use AppError

Async errors are automatically caught using catchAsync

Different responses for development & production

Example:
return next(new AppError('Resource not found', 404));

---------------------------------------------------------------
## 📦 Reusing This Starter

This repository is designed to be reused as a GitHub template.

Steps:

Click Use this template

Create a new repository

Run npm install

Start building your API

------------------------------------------------------------------
## 📌 Use Case

This starter is ideal for:

Portfolio projects

REST API backends

SaaS MVPs

Learning clean backend architecture

-------------------------------------------------------------------
## 👤 Author

**Ahmed Samir**
**Backend Developer (Node.JS)**
**GitHub: https://github.com/Ahmed-Samir12**


