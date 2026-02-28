# Cookie-Based Authentication Guide

## 🍪 Overview

Your authentication system now uses **httpOnly cookies** instead of localStorage. This is more secure because:

- ✅ **XSS Protection**: Cookies with `httpOnly` flag cannot be accessed via JavaScript
- ✅ **Automatic Management**: Browser handles sending cookies automatically
- ✅ **CSRF Protection**: Using `sameSite: 'lax'` provides protection against CSRF attacks
- ✅ **Secure in Production**: Cookies marked as `secure` in production (HTTPS only)

## 🔄 What Changed

### Backend Changes

1. **Cookie Parser Middleware** (`app.ts`)
   - Added `cookie-parser` to read cookies from requests
   - Added CORS configuration to allow credentials

2. **Login Response** (`user.controller.ts`)
   - Sets httpOnly cookie named `token` instead of returning token in response
   - Cookie expires in 7 days by default
   - `secure` flag enabled in production

3. **Logout Endpoint** (`user.controller.ts`)
   - New `POST /api/users/logout` endpoint
   - Clears the authentication cookie

4. **Auth Middleware** (`auth.middleware.ts`)
   - Reads token from `req.cookies.token` instead of Authorization header
   - Still validates JWT token the same way

### Frontend Changes

1. **API Service** (`api.service.ts`)
   - Added `withCredentials: true` to axios config
   - Removed token interceptor (not needed - cookies sent automatically)
   - Removed localStorage token management

2. **Auth Context** (`AuthContext.tsx`)
   - Removed token state (only user state now)
   - Calls `/users/me` on mount to verify session
   - Logout calls API endpoint to clear cookie
   - Only stores user info in localStorage (for UI display)

3. **Types** (`auth.types.ts`)
   - Removed `token` from AuthContextType
   - LoginResponse no longer includes token

## 🚀 How It Works

### 1. Login Flow

```
User enters credentials
    ↓
POST /api/users/login
    ↓
Backend verifies credentials
    ↓
Backend generates JWT token
    ↓
Backend sets httpOnly cookie: Set-Cookie: token=<jwt>; HttpOnly; SameSite=lax
    ↓
Frontend receives user data (no token in response)
    ↓
Frontend stores user in localStorage (for UI)
    ↓
Redirect to dashboard
```

### 2. Authenticated Request Flow

```
User visits protected page
    ↓
Frontend makes API request (axios with withCredentials: true)
    ↓
Browser automatically includes cookie in request
    ↓
Backend reads token from req.cookies.token
    ↓
Backend validates JWT
    ↓
Backend attaches user to req.user
    ↓
Backend processes request
    ↓
Response sent back
```

### 3. Logout Flow

```
User clicks logout
    ↓
POST /api/users/logout
    ↓
Backend clears cookie: Set-Cookie: token=; MaxAge=0
    ↓
Frontend clears user from localStorage
    ↓
Redirect to login
```

### 4. Session Verification on Page Load

```
Page loads/refreshes
    ↓
AuthContext checks localStorage for user
    ↓
If user exists, call GET /api/users/me (cookie sent automatically)
    ↓
If valid: Keep user logged in
    ↓
If invalid (401): Clear localStorage, redirect to login
```

## 🔐 Security Features

### HttpOnly Cookie

```javascript
res.cookie("token", token, {
  httpOnly: true, // Cannot be accessed by JavaScript
  secure: true, // HTTPS only (production)
  sameSite: "lax", // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

### CORS Configuration

```javascript
// Backend allows credentials from specific origins
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

### Frontend Axios Config

```javascript
axios.create({
  withCredentials: true, // Send cookies with every request
});
```

## 📝 API Changes

### Login Endpoint

**Before (localStorage):**

```json
POST /api/users/login

Response:
{
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**After (cookies):**

```json
POST /api/users/login

Response Headers:
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; SameSite=lax

Response Body:
{
  "message": "Login successful",
  "data": {
    "user": { /* user object */ }
  }
}
```

### New Logout Endpoint

```http
POST /api/users/logout

Response:
{
  "message": "Logout successful"
}

Response Headers:
Set-Cookie: token=; MaxAge=0
```

### Protected Endpoints

**Before (localStorage):**

```http
GET /api/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**After (cookies):**

```http
GET /api/users/me
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Testing

### 1. Test Login

```bash
# Login (notice the Set-Cookie header in response)
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' \
  -c cookies.txt \
  -v
```

### 2. Test Authenticated Request

```bash
# Use the cookie from login
curl http://localhost:3000/api/users/me \
  -b cookies.txt
```

### 3. Test Logout

```bash
# Logout (clears the cookie)
curl -X POST http://localhost:3000/api/users/logout \
  -b cookies.txt \
  -c cookies.txt \
  -v
```

### 4. Browser DevTools

1. Open DevTools → Application tab → Cookies
2. Look for cookie named `token` with:
   - HttpOnly: ✓
   - Secure: ✓ (in production)
   - SameSite: Lax

## ⚡ Quick Start

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Test the System

1. Open `http://localhost:5173`
2. Register/Login
3. Check DevTools → Application → Cookies
4. See the `token` cookie with HttpOnly flag
5. Logout and verify cookie is removed

## 🔧 Configuration

### Backend Environment (.env)

```env
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development  # or 'production'
```

### Frontend Environment (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

## 📊 Comparison: localStorage vs Cookies

| Feature             | localStorage      | httpOnly Cookies |
| ------------------- | ----------------- | ---------------- |
| **XSS Protection**  | ❌ Vulnerable     | ✅ Protected     |
| **Automatic Send**  | ❌ Manual         | ✅ Automatic     |
| **Size Limit**      | ~5-10MB           | ~4KB per cookie  |
| **CSRF Protection** | ✅ Not vulnerable | ✅ With SameSite |
| **Access from JS**  | ✅ Yes            | ❌ No (httpOnly) |
| **Mobile Support**  | ✅ Good           | ✅ Good          |
| **Implementation**  | Simple            | More setup       |

## 🚨 Common Issues

### Issue: Cookie not being sent

**Solution:** Make sure:

- Backend has `Access-Control-Allow-Credentials: true`
- Frontend has `withCredentials: true` in axios
- Both are on allowed origins list

### Issue: CORS errors

**Solution:**

- Check backend CORS configuration includes frontend URL
- Make sure credentials are allowed
- Clear browser cache

### Issue: Cookie not visible in DevTools

**Solution:**

- HttpOnly cookies won't show in JavaScript console
- Check DevTools → Application → Cookies section
- Use `-v` flag with curl to see headers

### Issue: Session not persisting after refresh

**Solution:**

- Check that cookie hasn't expired
- Verify `maxAge` is set correctly
- Make sure domain/path match

## 🔄 Migration from localStorage

If you had existing localStorage-based auth:

1. **User Experience**: Users will need to log in again (old tokens in localStorage won't work)
2. **Clear Old Data**: Consider adding cleanup code:

```javascript
// Clear old localStorage tokens
localStorage.removeItem("token");
```

## 🎯 Best Practices

1. **Always use HTTPS in production** - Set `secure: true` for cookies
2. **Set appropriate cookie expiration** - Match with JWT token expiration
3. **Use SameSite** - Protects against CSRF attacks
4. **Implement CSRF tokens** - For additional protection if needed
5. **Validate on backend** - Never trust client-side data
6. **Rotate secrets** - Change JWT_SECRET periodically
7. **Log authentication events** - Track login/logout for security

## 📚 Additional Resources

- [OWASP Cookie Security](https://owasp.org/www-community/controls/SecureFlag)
- [MDN: Using HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Previous Guide:** [AUTH_SYSTEM_GUIDE.md](./AUTH_SYSTEM_GUIDE.md) (now outdated - used localStorage)
**Quick Start:** [QUICK_START.md](./QUICK_START.md)
