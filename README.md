# Saharsa Food's

A full-stack web application for ordering Food online with real-time notifications.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, MongoDB
- **Real-time**: Socket.IO

## Prerequisites
- Node.js installed
- MongoDB installed and running locally (or update `.env` with Atlas URI)

## Setup & Run

### 1. Backend
Navigate to the `backend` directory:
```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

### 2. Frontend
Navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## Features
- **Customer**: Browse menu, add to cart, place order, track status.
- **Admin**: View all orders, update status (Processing, Delivered, Cancelled), receive real-time notifications.

## Environment Variables
Check `backend/.env` for configuration.
