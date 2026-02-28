# JWT Authentication System - Complete Guide

## Overview

This is a complete JWT-based authentication system with both backend (Express + TypeScript + PostgreSQL) and frontend (React + TypeScript + Vite) implementation.

## 🔧 Backend Setup

### 1. Environment Configuration

Create a `.env` file in the `backend/` directory (see `.env.example`):

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=scheduling_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Start Backend Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

---

## 🎨 Frontend Setup

### 1. Environment Configuration

Create a `.env` file in the `frontend/` directory (see `.env.example`):

```env
VITE_API_URL=http://localhost:3000/api
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Start Frontend Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

---

## 📚 Architecture

### Backend Architecture

```
backend/
├── src/
│   ├── controllers/
│   │   └── user.controller.ts       # Handles HTTP requests
│   ├── services/
│   │   └── user.service.ts          # Business logic
│   ├── entities/
│   │   └── User.entity.ts           # Database model
│   ├── routes/
│   │   ├── index.ts                 # Main router
│   │   └── user.routes.ts           # User routes
│   ├── middlewares/
│   │   └── auth.middleware.ts       # JWT authentication
│   └── utils/
│       └── jwt.util.ts              # JWT token management
├── config/
│   ├── config.service.ts            # Configuration service
│   └── database.ts                  # Database connection
└── app.ts                           # Application entry point
```

### Frontend Architecture

```
frontend/
└── src/
    ├── context/
    │   └── AuthContext.tsx          # Authentication state management
    ├── hooks/
    │   └── useAuth.ts               # Custom auth hook
    ├── services/
    │   └── api.service.ts           # API calls with axios
    ├── pages/
    │   ├── Login.tsx                # Login page
    │   ├── Register.tsx             # Registration page
    │   └── Dashboard.tsx            # Protected dashboard
    ├── components/
    │   └── ProtectedRoute.tsx       # Route guard
    └── types/
        └── auth.types.ts            # TypeScript types
```

---

## 🔐 Authentication Flow

### 1. User Registration

**Frontend:**

```typescript
const { register } = useAuth();
await register({ username, name, password, email });
```

**Backend Flow:**

1. Receives registration data
2. Validates input
3. Hashes password with bcrypt
4. Creates user in database
5. Auto-logs user in after registration

### 2. User Login

**Frontend:**

```typescript
const { login } = useAuth();
await login(username, password);
```

**Backend Flow:**

1. Receives credentials
2. Finds user by username
3. Verifies password with bcrypt
4. Generates JWT token
5. Returns user data + token

**Response:**

```json
{
  "message": "Login successful",
  "data": {
    "user": {
      /* user object */
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Token Storage

Token is stored in:

- `localStorage.setItem('token', token)`
- `localStorage.setItem('user', JSON.stringify(user))`

### 4. Protected API Requests

**Automatic Token Injection:**

```typescript
// axios interceptor automatically adds token to headers
config.headers.Authorization = `Bearer ${token}`;
```

**Backend Validation:**

```typescript
// authMiddleware validates token and attaches user to request
req.user = { userId, username };
```

### 5. Logout

**Frontend:**

```typescript
const { logout } = useAuth();
logout(); // Clears localStorage and redirects to login
```

---

## 🛣️ API Endpoints

### Public Endpoints (No Authentication)

#### Register

```http
POST /api/users
Content-Type: application/json

{
  "username": "johndoe",
  "name": "John Doe",
  "password": "password123",
  "email": "john@example.com"  // optional
}
```

#### Login

```http
POST /api/users/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}
```

### Protected Endpoints (Require Authentication)

All protected endpoints require the JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Get Current User

```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Get All Users

```http
GET /api/users?page=1&limit=10&isActive=true
Authorization: Bearer <token>
```

#### Get User by ID

```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User

```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

#### Update Password

```http
PATCH /api/users/:id/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "newpassword123"
}
```

#### Delete User (Soft Delete)

```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

---

## 🎯 Frontend Usage

### Using Auth Context

```typescript
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes

```typescript
import { ProtectedRoute } from './components/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Making API Calls

```typescript
import { apiService } from "./services/api.service";

// Token is automatically included
const users = await apiService.getAllUsers({ page: 1, limit: 10 });
```

---

## 🔒 Security Features

### Backend Security

1. **Password Hashing**
   - Uses bcrypt with salt rounds of 10
   - Passwords never stored in plain text

2. **Password Field Protection**
   - `select: false` on password field in entity
   - Password never returned in API responses

3. **JWT Token Security**
   - Tokens expire after configured time (default: 7 days)
   - Tokens signed with secret key
   - Payload includes only necessary data (userId, username)

4. **Route Protection**
   - Protected routes require valid JWT token
   - Invalid/expired tokens return 401

### Frontend Security

1. **Token Storage**
   - Stored in localStorage (consider httpOnly cookies for production)
   - Automatically removed on logout

2. **Automatic Token Refresh**
   - 401 responses trigger automatic logout
   - Redirects to login page

3. **Route Guards**
   - ProtectedRoute component prevents unauthorized access
   - Automatic redirect to login for unauthenticated users

---

## 🧪 Testing the System

### 1. Start Both Servers

Terminal 1 (Backend):

```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):

```bash
cd frontend
npm run dev
```

### 2. Test Registration

1. Navigate to `http://localhost:5173/register`
2. Fill in the registration form
3. Submit - should auto-login and redirect to dashboard

### 3. Test Login

1. Logout from dashboard
2. Navigate to `http://localhost:5173/login`
3. Enter username and password
4. Submit - should redirect to dashboard

### 4. Test Protected Routes

1. Try accessing `/dashboard` without logging in
2. Should redirect to `/login`
3. After login, should access dashboard successfully

### 5. Test API with curl

```bash
# Register
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","name":"Test User","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Get current user (replace <TOKEN> with actual token)
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🚀 Production Considerations

### Backend

1. **Use Environment Variables**
   - Never commit `.env` file
   - Use strong JWT_SECRET (random, long string)

2. **HTTPS Only**
   - Enable HTTPS in production
   - Set secure flags on cookies

3. **Rate Limiting**
   - Add rate limiting middleware
   - Prevent brute force attacks

4. **CORS Configuration**
   - Configure proper CORS origins
   - Don't use `*` in production

### Frontend

1. **Token Storage**
   - Consider using httpOnly cookies instead of localStorage
   - Implement refresh token mechanism

2. **Environment Variables**
   - Use proper production API URL
   - Don't expose sensitive data

3. **Build Optimization**
   - Run production build: `npm run build`
   - Serve with proper web server (nginx, etc.)

---

## 📝 Key Files Reference

### Backend

- **`src/utils/jwt.util.ts`** - JWT token generation and verification
- **`src/middlewares/auth.middleware.ts`** - Authentication middleware
- **`src/controllers/user.controller.ts`** - Login/register handlers
- **`src/services/user.service.ts`** - User business logic
- **`config/config.service.ts`** - JWT configuration

### Frontend

- **`src/context/AuthContext.tsx`** - Auth state provider
- **`src/hooks/useAuth.ts`** - Auth hook
- **`src/services/api.service.ts`** - Axios configuration with JWT
- **`src/components/ProtectedRoute.tsx`** - Route protection
- **`src/pages/Login.tsx`** - Login UI
- **`src/pages/Register.tsx`** - Registration UI
- **`src/pages/Dashboard.tsx`** - Protected page example

---

## ❓ Troubleshooting

### "Cannot find module 'axios'"

```bash
cd frontend
npm install
```

### "JWT_SECRET not found"

Create `.env` file in backend directory with JWT_SECRET

### "Database connection failed"

Check PostgreSQL is running and credentials in `.env` are correct

### "401 Unauthorized"

- Check token is valid and not expired
- Verify Authorization header format: `Bearer <token>`
- Check JWT_SECRET matches between token generation and verification

### Frontend not connecting to backend

- Verify backend is running on correct port
- Check VITE_API_URL in frontend/.env
- Verify CORS is configured correctly

---

## 📄 License

This authentication system is part of the Scheduling Management System project.
