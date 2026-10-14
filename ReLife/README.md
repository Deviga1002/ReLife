# ReLife – AI-Powered Circular Community Hub

Full-stack MERN circular economy platform. Donate, sell, repair, recycle, and upcycle items.

## Roles (exactly 5)

| Role | Value | Access |
|------|--------|--------|
| Admin | `admin` | Full platform management |
| User | `user` | Browse, list, donate, buy, requests |
| NGO | `ngo` | Donation discovery & coordination |
| Service Provider | `service_provider` | Repair / recycle / upcycle services |
| Delivery Partner | `delivery_partner` | Delivery assignments |

- Public registration and Google sign-in always create **User** role only.
- Only an Admin can assign privileged roles (Admin panel → Users).
- Role is enforced on the backend; frontend only redirects to the correct dashboard.

## Tech Stack

- Frontend: React 18, Vite, React Router, Axios, Lucide React
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt
- Google: Google Identity Services (frontend) + `google-auth-library` ID token verify (backend)

## Quick Start (Windows PowerShell)

### 1. MongoDB Atlas

Create a free cluster, database user, allow `0.0.0.0/0`, copy connection string.

### 2. Backend

```powershell
cd ReLife\backend
copy .env.example .env
notepad .env
```

Set at least:

```env
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/relife?retryWrites=true&w=majority
JWT_SECRET=any_long_secret_at_least_32_characters
FRONTEND_URL=http://localhost:3000
```

Optional Google:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

```powershell
npm install
npm run seed
npm run dev
```

Leave this window open (port **5000**).

### 3. Frontend

```powershell
cd ReLife\frontend
copy .env.example .env
```

If using Google, set the **same** Client ID:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

```powershell
npm install
npm run dev
```

Open **http://localhost:3000**

### Seed accounts

| Role  | Email             | Password  |
|-------|-------------------|-----------|
| Admin | admin@relife.app  | Admin@123 |
| User  | demo@relife.app   | Demo@123  |

## Google Cloud Console setup

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create **OAuth client ID** → Application type: **Web application**
3. **Authorized JavaScript origins:**
   - `http://localhost:3000`
   - (production) `https://your-frontend-domain.com`
4. **Authorized redirect URIs** (optional for GIS popup; add if required):
   - `http://localhost:3000`
5. Copy **Client ID** into:
   - Backend `.env` → `GOOGLE_CLIENT_ID`
   - Frontend `.env` → `VITE_GOOGLE_CLIENT_ID`
6. Client Secret is optional for pure ID-token (GIS) flow; can still be stored as `GOOGLE_CLIENT_SECRET`.

Without these variables, email/password login still works; Google buttons are hidden/disabled with a clear message.

## Role dashboards after login

Login page includes a **Select Role** dropdown. The backend compares it with the role stored in MongoDB. Mismatch → "The selected role does not match your account."

| Role | Path |
|------|------|
| admin | `/admin/dashboard` |
| user | `/user/dashboard` |
| ngo | `/ngo/dashboard` |
| service_provider | `/service-provider/dashboard` |
| delivery_partner | `/delivery/dashboard` |

Admin management panel (users/roles/products): `/admin`

## Assigning roles

1. Login as Admin
2. Admin → Users tab
3. Use the role dropdown next to each user
4. Changes are saved via `PUT /api/admin/users/:id` (admin-only)

## API auth endpoints

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/auth/register` | Always creates `user` role |
| POST | `/api/auth/login` | Email/password |
| POST | `/api/auth/google` | Body: `{ "credential": "<Google ID token>" }` |
| GET | `/api/auth/me` | Current user |

## Features preserved

Product CRUD + images, donations, purchase requests, repair/recycle/upcycle, favorites, notifications, rewards, sustainability estimates, admin stats & CSV export.

## Limitations

- Google works only when Client ID is configured correctly
- No online payments
- Delivery assignments are a dashboard scaffold (status workflow can be extended)
- Environmental impact figures are estimates

## Changed in this update

- User model: 5 roles, `googleId`, `authProvider`, optional password for Google users
- `POST /api/auth/google` with server-side ID token verification
- Login & Register: Continue with Google (GIS)
- Admin: role assignment dropdown for all 5 roles
- Role-specific dashboards (NGO, Service Provider, Delivery Partner)
- Role-based login redirects
- `.env.example` files updated for Google


## New modules (Pickup, Chat, Notifications, Rewards)

### Pickups
- Schedule with date + time slots and clash detection
- QR verification token (scan or manual paste)
- Statuses: Scheduled, Confirmed, Rescheduled, Completed, Cancelled
- Routes: `/pickups`, `/pickups/schedule`, `/pickups/:id`

### Chat (Socket.IO)
- Start from product details → Message button
- Real-time messages, persisted in MongoDB
- Routes: `/chat`, `/chat/:conversationId`

### Rewards
- Points history, badges, leaderboard from real data
- Route: `/rewards`

### Setup notes
```powershell
cd backend
npm install
npm run dev

cd frontend  
npm install
npm run dev
```
Socket.IO uses the same port as the API (5000). Frontend connects to `http://localhost:5000` by default.
