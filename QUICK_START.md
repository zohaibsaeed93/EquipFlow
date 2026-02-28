# Quick Start Guide - JWT Authentication System

## 🚀 Get Started in 3 Minutes

### Step 1: Setup Backend

```bash
# Navigate to backend
cd backend

# Create .env file
cp .env.example .env

# Edit .env and set your database credentials and JWT secret
# Minimum required:
# JWT_SECRET=your_random_secret_key_here
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=your_password
# DB_DATABASE=scheduling_db

# Install dependencies (if not already done)
npm install

# Start backend
npm run dev
```

Backend should be running on `http://localhost:3000`

### Step 2: Setup Frontend

```bash
# Navigate to frontend (from project root)
cd frontend

# Create .env file
cp .env.example .env

# The default settings should work:
# VITE_API_URL=http://localhost:3000/api

# Install dependencies (if not already done)
npm install

# Start frontend
npm run dev
```

Frontend should be running on `http://localhost:5173`

### Step 3: Test the System

1. Open browser: `http://localhost:5173`
2. You'll be redirected to login (no account yet)
3. Click "Sign up" or navigate to `/register`
4. Create an account with:
   - Username (required)
   - Name (required)
   - Password (required)
   - Email (optional)
5. After registration, you'll be auto-logged in
6. You'll see the dashboard with your profile info
7. Click "Logout" to test logout
8. Try logging in again with your credentials

## ✅ What You Get

### Backend Features

- ✓ Username-based authentication (not email)
- ✓ JWT token generation with configurable expiry
- ✓ Password hashing with bcrypt
- ✓ Protected API routes
- ✓ Auth middleware for route protection
- ✓ Full CRUD operations for users
- ✓ Soft delete support

### Frontend Features

- ✓ Beautiful login/register pages
- ✓ Auth context for global state
- ✓ Automatic token management
- ✓ Protected routes
- ✓ Auto-redirect on authentication
- ✓ Error handling
- ✓ Loading states

## 📱 Available Routes

### Frontend Routes

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Protected dashboard (requires login)
- `/` - Redirects to dashboard

### API Endpoints

**Public:**

- `POST /api/users/login` - Login
- `POST /api/users` - Register

**Protected (requires JWT token):**

- `GET /api/users/me` - Get current user
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/password` - Change password
- `DELETE /api/users/:id` - Soft delete user

## 🧪 Quick API Test

```bash
# Register a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "name": "Test User",
    "password": "test123"
  }'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123"
  }'

# Copy the token from response and use it:
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔒 Security Notes

1. **Change JWT_SECRET** - Use a strong random string in production
2. **Use HTTPS** - Always use HTTPS in production
3. **Token Expiry** - Default is 7 days, adjust as needed
4. **Database Security** - Never commit .env file with credentials

## 📚 Full Documentation

See [AUTH_SYSTEM_GUIDE.md](./AUTH_SYSTEM_GUIDE.md) for complete documentation including:

- Detailed architecture
- Full API reference
- Frontend component usage
- Security best practices
- Production deployment guide
- Troubleshooting

## ❓ Common Issues

**Q: "Cannot connect to database"**
A: Make sure PostgreSQL is running and credentials in `.env` are correct

**Q: "Token expired" error**
A: Login again to get a new token, or increase JWT_EXPIRES_IN in .env

**Q: "CORS error"**
A: Make sure backend is running and VITE_API_URL is correct in frontend/.env

**Q: User entity changes not reflecting**
A: TypeORM synchronize is enabled in development, restart backend server

## 🎯 Next Steps

1. Customize the dashboard UI
2. Add more protected routes
3. Implement token refresh mechanism
4. Add role-based access control (RBAC)
5. Add email verification
6. Add password reset functionality
7. Add remember me functionality
8. Implement session management

## 💡 Pro Tips

- Use the browser DevTools Network tab to see API requests/responses
- Check browser Console for any frontend errors
- Check backend terminal for API logs
- Token is stored in localStorage - check Application tab in DevTools
- Use Postman or curl for direct API testing

---

**Need help?** Check the full guide: [AUTH_SYSTEM_GUIDE.md](./AUTH_SYSTEM_GUIDE.md)
