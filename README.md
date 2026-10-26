# Agri-Tech: Smart Farming Management (MERN)

Full-stack farm management app: farms, crops, soil health, weather forecasts with farming advisories, pest/disease alerts, resource marketplace with order tracking, expert consultation, community forum, analytics dashboard and an admin panel. JWT auth with farmer / expert / admin roles. English and Hindi UI.

## Requirements
- Node.js 18+ (the weather route uses the built-in `fetch`)
- MongoDB (local or Atlas)

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm run seed             
npm run dev               # http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev               # http://localhost:5173 (proxies /api to :5000)
```

## User flow
Home → Farms (add/edit/delete, with coordinates) → Crops (CRUD) → Crop details (soil readings, recommendations, resource usage, activity log, alerts) → Weather (7-day forecast per farm) → Buy Resources (cart → order) → Orders (tracking).

## Structure
```
server/
  models/      User, Farm, Crop, Resource, Order, WeatherData, Post, Consultation, Alert
  routes/      auth, farms, crops, weather, resources, orders, posts, consultations, alerts, analytics, admin
  middleware/  auth (JWT + roles), error handling/validation, async wrapper
  utils/soil.js  rule-based soil recommendations
client/src/
  pages/       one lazy-loaded page per feature
  components/  Navbar, ProtectedRoute, shared UI helpers
  context/     AuthContext
  i18n.js      English + Hindi strings
```

