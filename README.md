---
# 🛠️ WriteHub Backend API

WriteHub backend is a secure and scalable REST API built with Node.js and MongoDB to support authentication and all user data features: blogs, notes, todos, goals, and dashboard analytics.
---

## 🚀 Features

### 🔐 Authentication

- Signup with email verification code
- Email verification required before login
- JWT-based access & refresh tokens
- Forgot password with email code

### ✍️ Content Management

#### 📝 Blogs

- Create, edit, delete
- Infinite scroll via pagination

#### 🗒️ Notes

- Categorized notes with full CRUD

#### ✅ Todos

- Create/update/delete
- Strike-through & filters

#### 🎯 Goals

- Add/edit/remove goals
- Drag-and-drop support to reorder goals

### 📊 Dashboard

- Summary of total items
- Quotes API
- Recent user activity log

---

## 📁 Folder Structure

server/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── config/
└── server.js

---

## 🧰 Tech Stack

- **Node.js**
- **Express**
- **MongoDB + Mongoose**
- **JWT**
- **Nodemailer**
- **Cookie-parser**, **cors**, **helmet**

---

## 🛠️ Setup & Run

```bash
git clone https://github.com/vishalmahto0007/writehub-server.git
cd writehub-server
npm install
npm run dev
```

👤 Author
Vishal Mahto
