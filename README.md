# 🛡️ Kadali — Women's Safety Platform

A **production-ready full-stack web platform** for women's safety. Hardware devices send emergency and sensor data to the cloud, enabling real-time monitoring and rapid volunteer response.

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Kadali Platform                            │
│                                                                     │
│  ┌──────────────┐     REST API      ┌──────────────────────────┐   │
│  │  Next.js     │ ◄────────────────► │  Express.js Backend      │   │
│  │  Frontend    │   Socket.io WS    │  (Node.js)               │   │
│  │  (Port 3000) │ ◄────────────────► │  (Port 5000)             │   │
│  └──────────────┘                   └────────────┬─────────────┘   │
│                                                  │                  │
│  ┌──────────────────────────────┐   ┌────────────▼─────────────┐   │
│  │  IoT Hardware Device         │   │  MongoDB                  │   │
│  │  (GPS + Sensors + Button)    ├──►│  (Users, Devices, Alerts, │   │
│  │  POST /api/device-api/*      │   │   SensorData)             │   │
│  └──────────────────────────────┘   └──────────────────────────┘   │
│                                                                     │
│  Emergency Flow:                                                    │
│  Device → POST /emergency → Create Alert → Socket.io broadcast     │
│         → Volunteer dashboards update in real-time                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TailwindCSS, react-leaflet |
| **Backend** | Node.js, Express.js, Socket.io |
| **Database** | MongoDB with Mongoose, 2dsphere geospatial indexes |
| **Auth** | JWT (access tokens), bcryptjs password hashing |
| **Real-time** | Socket.io for emergency alert broadcasting |
| **Maps** | Leaflet (react-leaflet) with OpenStreetMap tiles |

---

## 📋 Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **MongoDB** v6+ (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** v8+

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/havishkarthik/Kadali.git
cd Kadali
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kadali
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
DEVICE_API_KEY=your-device-api-key
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4. Seed the Database (Optional)

```bash
cd backend
npm run seed
```

This creates:
- Admin: `admin@kadali.com` / `admin123`
- Users: `user1@kadali.com` / `user123`, `user2@kadali.com` / `user123`
- Volunteers: `vol1@kadali.com` / `vol123`, `vol2@kadali.com` / `vol123`
- 3 sample devices, 5 alerts, 10 sensor data records

---

## ▶️ Running Locally

Start both servers (in separate terminals):

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running at http://localhost:3000
```

Then open http://localhost:3000 in your browser.

---

## 📡 API Documentation

### Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login → returns JWT |
| `GET` | `/auth/me` | Get current user (auth required) |

**Register / Login payload:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "user"
}
```

### Users (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | List all users (filter: `?role=volunteer`) |
| `GET` | `/users/:id` | Get user by ID |
| `PUT` | `/users/:id` | Update user |
| `DELETE` | `/users/:id` | Deactivate user |

### Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/devices` | List devices (own for user, all for admin) |
| `POST` | `/devices` | Register a new device |
| `GET` | `/devices/:id` | Get device details |
| `PUT` | `/devices/:id` | Update device |
| `DELETE` | `/devices/:id` | Remove device |

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/alerts` | List alerts (filtered by role) |
| `GET` | `/alerts/active` | Active alerts for volunteers |
| `POST` | `/alerts` | Create manual alert |
| `PUT` | `/alerts/:id/acknowledge` | Volunteer acknowledges |
| `PUT` | `/alerts/:id/respond` | Volunteer starts responding |
| `PUT` | `/alerts/:id/resolve` | Mark resolved |
| `GET` | `/alerts/stats` | Statistics (admin only) |

### Device API (Hardware endpoints)

> Requires `X-Device-Api-Key` header with the `DEVICE_API_KEY` value.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/device-api/data` | Send sensor data |
| `POST` | `/device-api/emergency` | Send emergency signal |
| `POST` | `/device-api/heartbeat` | Device health heartbeat |

---

## 📟 Hardware Device Integration

### Send Sensor Data

```bash
curl -X POST http://localhost:5000/api/device-api/data \
  -H "Content-Type: application/json" \
  -H "X-Device-Api-Key: your-device-api-key" \
  -d '{
    "device_id": "KDL-001",
    "location": { "latitude": 12.9716, "longitude": 77.5946 },
    "sensors": {
      "temperature": 36.5,
      "heartRate": 88,
      "accelerometer": { "x": 0.1, "y": 0.2, "z": 9.8 },
      "bleRssi": -65,
      "loraSignal": -110
    },
    "batteryLevel": 78,
    "isEmergency": false
  }'
```

### Send Emergency Alert

```bash
curl -X POST http://localhost:5000/api/device-api/emergency \
  -H "Content-Type: application/json" \
  -H "X-Device-Api-Key: your-device-api-key" \
  -d '{
    "device_id": "KDL-001",
    "location": { "latitude": 12.9716, "longitude": 77.5946 },
    "batteryLevel": 65
  }'
```

### Heartbeat

```bash
curl -X POST http://localhost:5000/api/device-api/heartbeat \
  -H "Content-Type: application/json" \
  -H "X-Device-Api-Key: your-device-api-key" \
  -d '{ "device_id": "KDL-001", "batteryLevel": 90 }'
```

---

## 🔄 Real-time Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `new-alert` | Server → Client | New emergency alert created |
| `alert-update` | Server → Client | Alert status changed |
| `volunteer-location` | Client → Server | Volunteer broadcasts location |

**Connect with auth:**
```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});
socket.on('new-alert', (alert) => { /* handle */ });
```

---

## 🚀 Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Set root directory: `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
   - `NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com`
5. Deploy

### Backend → Render

1. Create a new **Web Service** at [render.com](https://render.com)
2. Connect your GitHub repo
3. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables (all from `.env.example`)
5. Use [MongoDB Atlas](https://www.mongodb.com/atlas) for production database

---

## 📸 Screenshots

| Page | Description |
|------|-------------|
| Landing Page | Hero section with gradient background |
| User Dashboard | Device status, alert history, emergency button |
| Volunteer Dashboard | Active alerts map with real-time updates |
| Admin Dashboard | Full analytics, user management |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🔑 Default Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kadali.com | admin123 |
| User | user1@kadali.com | user123 |
| Volunteer | vol1@kadali.com | vol123 |

> ⚠️ Change all default credentials before deploying to production.
