# Disaster Relief Tracker Backend

Production-ready Express and MongoDB API for the Disaster Relief Resource Tracker frontend.

## Setup

1. Open a terminal in `backend/`
2. Install dependencies with `npm install`
3. Update `.env` if needed
4. Start the API with `npm run dev` or `npm start`

## Environment Variables

- `PORT=5000`
- `MONGO_URI=<mongodb connection string>`
- `JWT_SECRET=replace-with-a-strong-secret`
- `CLIENT_URL=<frontend production url>`
- `CORS_ORIGIN=<comma-separated allowed origins>`
- `CORS_ORIGIN_REGEX=<optional regex for allowed origins>`

Notes:
- `CLIENT_URL` / `CORS_ORIGIN` are normalized (trailing `/` removed) before matching.
- By default, the API also allows your Vercel app + preview URLs matching:
  `https://disaster-releif-management-tracker(-<preview>).vercel.app`

## Base URL

`http://localhost:5000/api`

## Auth Header

`Authorization: Bearer <token>`

## Example Responses

### Signup / Login

```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "_id": "65f1b8d5f5d65e8d9f0b1234",
    "name": "Admin User",
    "email": "admin@relief.org",
    "role": "admin",
    "createdAt": "2026-03-17T16:00:00.000Z"
  }
}
```

### Get Disasters

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "65f1c0b2f5d65e8d9f0b4567",
      "type": "Flood",
      "location": "Chennai",
      "latitude": 13.0827,
      "longitude": 80.2707,
      "severity": "High",
      "status": "Active",
      "createdAt": "2026-03-17T16:05:00.000Z"
    }
  ]
}
```

### Create Dispatch

```json
{
  "success": true,
  "message": "Dispatch created successfully",
  "data": {
    "_id": "65f1c7aef5d65e8d9f0b7890",
    "itemName": "Water Bottles",
    "quantity": 50,
    "fromCenter": "65f1c300f5d65e8d9f0b1111",
    "destination": "Chennai",
    "assignedVolunteers": [
      "65f1c550f5d65e8d9f0b2222"
    ],
    "dispatchStatus": "Pending",
    "createdAt": "2026-03-17T16:10:00.000Z"
  }
}
```

## Frontend Axios Example

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

## Deployment

### Backend on Render

- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `PORT=5000`
  - `MONGO_URI=<mongodb atlas connection string>`
  - `JWT_SECRET=<secure random string>`
  - `CLIENT_URL=https://disaster-releif-management-tracker.vercel.app`
  - `CORS_ORIGIN=https://disaster-releif-management-tracker.vercel.app`

### Frontend on Vercel

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:
  - `VITE_API_URL=https://your-render-service.onrender.com/api`
