# Project SETU

Project SETU is a free, offline-first emergency communication platform that works over local Wi-Fi on any smartphone browser without needing an internet connection. It allows people to chat, send GPS-based SOS alerts.

## Project Demonstration

[...]

## Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, React Leaflet, Zustand
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Real-time:** Socket.io

## Key Features

* **Works Offline:** If your internet drops, the app saves your data and updates when you reconnect.
* **Two Modes:** Switch between PEACE (normal) and DISASTER (emergency) modes instantly for everyone.
* **Live Map:** See emergencies happening on an interactive map right away.
* **Instant Updates:** Messages, emergencies, and map locations update instantly for everyone without refreshing.
* **Report Emergencies:** Easily report SOS, Fire, Medical, or other issues so they show up on the map.
* **Admin Controls:** Admins can manage the system, change modes, or clear data.
* **Step-by-step Guides:** Built-in checklists to help you know what to do in different situations.
* **Safe and Secure:** Built with checks to keep the app running smoothly and block spam.

## Prerequisites

Before starting, make sure you have:

* Node.js (Version 18 or newer)
* MongoDB (Installed locally or using MongoDB Atlas)
* Git

## Installation and Setup

Follow these steps to run the project on your computer:

### 1. Install Dependencies

Run these commands to install packages for both the server and client:

```bash
cd server
npm install
cd ../client
npm install
```

### 2. Set Up Environment Variables

Go to the `server` folder, create a new `.env` file, and add your details:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret_key
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:5173
```

### 3. Start the App

Start the server and client in two different terminal windows:

**Terminal 1 (Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```

* The backend will run on port `3000`.
* The frontend will be open at `http://localhost:5173`.

