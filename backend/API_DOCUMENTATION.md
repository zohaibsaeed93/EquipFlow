# User API Documentation

Base URL: `http://localhost:<PORT>/api`

## Authentication

### Login

**POST** `/users/login`

Login with username and password.

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true,
    "createdAt": "2026-03-01T12:00:00.000Z",
    "updatedAt": "2026-03-01T12:00:00.000Z"
  }
}
```

**Response (401 Unauthorized):**

```json
{
  "error": "Invalid credentials"
}
```

---

## User CRUD Operations

### Create User

**POST** `/users`

Create a new user with username-based authentication.

**Request Body:**

```json
{
  "username": "johndoe",
  "name": "John Doe",
  "password": "password123",
  "email": "john@example.com" // optional
}
```

**Response (201 Created):**

```json
{
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true,
    "createdAt": "2026-03-01T12:00:00.000Z",
    "updatedAt": "2026-03-01T12:00:00.000Z"
  }
}
```

---

### Get All Users

**GET** `/users`

Retrieve all users with pagination.

**Query Parameters:**

- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `isActive` (optional) - Filter by active status (true/false)

**Example:** `/users?page=1&limit=10&isActive=true`

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid",
      "username": "johndoe",
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "2026-03-01T12:00:00.000Z",
      "updatedAt": "2026-03-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### Get User by ID

**GET** `/users/:id`

Retrieve a specific user by their ID.

**Response (200 OK):**

```json
{
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true,
    "createdAt": "2026-03-01T12:00:00.000Z",
    "updatedAt": "2026-03-01T12:00:00.000Z"
  }
}
```

**Response (404 Not Found):**

```json
{
  "error": "User not found"
}
```

---

### Get User by Username

**GET** `/users/username/:username`

Retrieve a specific user by their username.

**Response (200 OK):**

```json
{
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true,
    "createdAt": "2026-03-01T12:00:00.000Z",
    "updatedAt": "2026-03-01T12:00:00.000Z"
  }
}
```

---

### Update User

**PUT** `/users/:id`

Update user information.

**Request Body:**

```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "username": "johnupdated",
  "isActive": true
}
```

All fields are optional in the request body.

**Response (200 OK):**

```json
{
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "username": "johnupdated",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "isActive": true,
    "createdAt": "2026-03-01T12:00:00.000Z",
    "updatedAt": "2026-03-01T12:00:00.000Z"
  }
}
```

---

### Update Password

**PATCH** `/users/:id/password`

Update user password.

**Request Body:**

```json
{
  "password": "newpassword123"
}
```

**Response (200 OK):**

```json
{
  "message": "Password updated successfully"
}
```

---

### Delete User (Soft Delete)

**DELETE** `/users/:id`

Soft delete a user by setting `isActive` to false.

**Response (200 OK):**

```json
{
  "message": "User deleted successfully"
}
```

---

### Permanently Delete User

**DELETE** `/users/:id/permanent`

Permanently delete a user from the database.

**Response (200 OK):**

```json
{
  "message": "User permanently deleted"
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**

```json
{
  "error": "Error message describing what went wrong"
}
```

**404 Not Found:**

```json
{
  "error": "User not found"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Failed to perform operation"
}
```

---

## Notes

- All passwords are hashed using bcrypt before storage
- The password field is never returned in responses (select: false in entity)
- Username must be unique
- Users have a soft delete feature (isActive flag)
- Login is username-based, not email-based
