# 🏥 Smart Appointment & Queue Booking System for Hospitals (DocQueue)



**DocQueue** is a MERN-stack based Smart Appointment & Queue Booking System designed to streamline outpatient visits and enhance the overall patient experience. Patients can conveniently schedule appointments online, monitor their position in the queue in real-time, and arrive at the hospital only when their consultation time is approaching. Hospital staff and administrators can efficiently manage appointments, queues, doctors, and patient flow through a centralized dashboard.

---

## 🛠️ Tech Stack

### Frontend

* React.js (Vite)
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Express.js
* TypeScript
* Socket.IO

### Database

* MongoDB

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

* Node.js (v18 or later)
* npm
* MongoDB (Local or MongoDB Atlas)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository


backend: npm i
frontend: npm i


### 2. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend` directory.

Example configuration:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Refer to `docs/PROJECT_DOCUMENTATION.md` for all required environment variables.

---

## ▶️ Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run at:

```text
http://localhost:5000
```

### Start Frontend Application

```bash
**cd frontend
npm run dev**
```

Frontend will run at:

```text
http://localhost:5173
```

---



## 📄 License

This project is licensed under the MIT License.
