# Agora Platform Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Setup MySQL Database

**Option A: Using MySQL Workbench or phpMyAdmin**
- Open MySQL Workbench or phpMyAdmin
- Execute the SQL script from `database.sql`

**Option B: Using MySQL Command Line**
```bash
mysql -u root -p < database.sql
```

### 3. Configure Environment Variables
Edit the `.env` file with your MySQL credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=agora_db
```

### 4. Run the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on http://localhost:5000

## API Endpoints

### 1. Register User
**POST** `/register`
```json
{
  "username": "John Doe",
  "tagline": "Seeking truth",
  "password": "password123"
}
```

### 2. Login
**POST** `/login`
```json
{
  "userId": "AGORA-0001",
  "password": "password123"
}
```

### 3. Save Belief
**POST** `/belief`
```json
{
  "userId": "AGORA-0001",
  "belief": "Agnostic"
}
```

### 4. Save Categories
**POST** `/categories`
```json
{
  "userId": "AGORA-0001",
  "categories": ["Ethics", "Free Will", "Consciousness"]
}
```

### 5. Get User Data
**GET** `/user/:userId`

## Database Schema

- **users**: Stores user account information
- **categories**: Stores available philosophical categories
- **user_categories**: Junction table linking users to their selected categories
