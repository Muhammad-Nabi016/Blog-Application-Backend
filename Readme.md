# Blog Application — Backend Development

Blog Application is a developed as part of my **Full Stack Web Development Internship Task at Codomax Digital Solutions**. This project focuses on building a backend server, creating REST APIs, and integrating the frontend with backend services.

## 🚀 Project Overview

Blog Application allows users to register, log in, and manage blog posts through a connected frontend and backend. The backend is built using Node.js and Express.js.

## ✨ Features

- **User Registration:** Register new users with their details.
- **User Login:** Authenticate users using their email and password.
- **Create Blog:** Create blog posts through the application.
- **View Blogs:** Retrieve blog posts using REST APIs.
- **Edit Blogs:** Update existing blog posts.
- **Delete Blogs:** Remove blog posts.
- **Dashboard Integration:** Display blog information and statistics.
- **Frontend-Backend Integration:** Connect frontend pages with backend API endpoints.

## 🛠️ Technologies Used

- Node.js
- Express.js
- JavaScript
- HTML5
- CSS3
- REST APIs
- bcryptjs
- CORS

## 📁 Project Structure

```text
Blog Application/
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── create-blog.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── backend/
    └── server.js
```

*Note: Adjust the folder structure above to match your actual repository.*

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Muhammad-Nabi016/Blog-Application-Backend
```

### 2. Open the project folder

```bash
cd Blog Application
```

### 3. Install backend dependencies

Open the terminal in your backend folder and run:

```bash
npm install
```

Make sure `express`, `cors`, and `bcryptjs` are installed.

### 4. Start the backend server

```bash
node server.js
```

The backend server runs at:

```text
http://localhost:5000
```

### 5. Run the frontend

Open the frontend's `index.html` using VS Code Live Server or another local web server.

## 🔗 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Check server status |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in a user |
| GET | `/api/blogs` | Retrieve blogs |
| GET | `/api/blogs/:id` | Retrieve a specific blog |
| POST | `/api/blogs` | Create a blog |
| PUT | `/api/blogs/:id` | Update a blog |
| DELETE | `/api/blogs/:id` | Delete a blog |

## 📚 Learning Outcomes

- Setting up a backend server with Node.js and Express.js.
- Designing REST API endpoints.
- Handling user registration and login.
- Connecting frontend forms with backend APIs.
- Implementing basic blog CRUD operations.
- Understanding request handling and JSON responses.

## ⚠️ Current Limitations

The current backend uses in-memory arrays for storing users and blogs. Therefore, data may be lost when the server restarts. Persistent database integration and additional authentication/security improvements can be added in future iterations.

## 🎯 Internship

This project was developed as part of my **Full Stack Web Development Internship at Codomax Digital Solutions**.

---

## Author

**Muhammad Nabi**

**Project:** Blog Application  
**Focus:** Backend Development and API Integration  
**Technologies:** Node.js, Express.js, JavaScript, HTML, CSS
