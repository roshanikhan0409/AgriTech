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
npm run seed              # demo users, resources and alerts
npm run dev               # http://localhost:5000
```

Seeded accounts:

| Role   | Email                 | Password  |
|--------|-----------------------|-----------|
| Admin  | admin@agritech.test   | admin123  |
| Expert | expert@agritech.test  | expert123 |
| Farmer | farmer@agritech.test  | farmer123 |

Change or delete these before any real deployment.

### 2. Frontend
```bash
cd client
npm install
npm run dev               # http://localhost:5173 (proxies /api to :5000)
```
For a separately hosted API, set `VITE_API_URL` (e.g. `https://api.example.com/api`).

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

## API overview (all under `/api`)
- `POST /auth/register`, `POST /auth/login`, `GET/PUT /auth/me`
- `/farms`, `/crops` (CRUD) plus `/crops/:id/soil`, `/crops/:id/usage`, `/crops/:id/log`
- `GET /weather/farm/:farmId` (Open-Meteo, no API key, cached 30 min)
- `/resources` (admin writes/approval), `/orders` (stock checked, prices taken server-side)
- `/posts` (+ comments, admin hide), `/consultations` (experts answer), `/alerts` (admin/expert publish; farmers see ones matching their crops)
- `GET /analytics/summary`, `/admin/stats`, `/admin/users`

## Security notes
- Passwords hashed with bcrypt; JWT sent as a Bearer token.
- Public registration only creates farmers; admins promote users from the Admin page (or via the seed script).
- Farmers can only read/modify their own farms, crops and orders; order prices are never trusted from the client.
- Before production: use a strong `JWT_SECRET`, restrict `CLIENT_URL`, add rate limiting (e.g. `express-rate-limit`) and `helmet`, and serve over HTTPS.

## Testing with Postman
Log in via `POST /api/auth/login`, copy the `token`, then send `Authorization: Bearer <token>` on other requests.

## Known limitations
- Soil thresholds in `server/utils/soil.js` are generic guidance values, not crop- or region-specific agronomy. Have an agronomist tune them.
- Pest/disease alerts are published manually by admins/experts; there is no automated detection.
- The UI is translated for navigation, home and common labels; other screens are English only and need strings added to `client/src/i18n.js`.
- No automated test suite yet.
