# Pet Adoption Center System

A full-stack web application for managing pet adoptions, built with React + Vite (frontend) and Express + MySQL (backend).

---

## Getting Started (For Collaborators)

### Prerequisites

Make sure you have these installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Yarn** - Install with `npm install -g yarn`
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)

---

## Option 1: Clone via Command Line (CLI)

```bash
# 1. Clone the repository
git clone https://github.com/kenmondragon/dba-proj.git

# 2. Navigate into the project
cd dba-proj
```

---

## Option 2: Clone via GitHub Desktop

1. Open **GitHub Desktop**
2. Click **File** > **Clone Repository**
3. Go to the **URL** tab
4. Paste: `https://github.com/kenmondragon/dba-proj.git`
5. Choose where to save it on your computer
6. Click **Clone**

---

## Project Setup

### Step 1: Set Up the Database

1. Open MySQL Workbench or terminal
2. Log in to MySQL:
   ```bash
   mysql -u root -p
   ```
3. Copy and run all SQL from `DATABASE_INIT.md` to create the database, tables, and sample data

### Step 2: Configure Environment

Create a `.env` file in the `server/` folder:

```bash
cd server
```

Create `server/.env` with:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pet_adoption_center
JWT_SECRET=your_secret_key_here
PORT=5000
```

Replace `your_mysql_password` with your actual MySQL password.

### Step 3: Install Dependencies

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd server
yarn install
```

**Terminal 2 - Frontend:**
```bash
cd client
yarn install
```

### Step 4: Run the Application

**Terminal 1 - Start Backend:**
```bash
cd server
yarn start
```
Server runs at: http://localhost:5000

**Terminal 2 - Start Frontend:**
```bash
cd client
yarn dev
```
Frontend runs at: http://localhost:5173

---

## Project Structure

```
dba-proj/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth contexts
│   │   ├── pages/          # Page components
│   │   │   └── admin/      # Admin panel pages
│   │   └── services/       # API services
│   └── package.json
├── server/                 # Express backend
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API routes
│   ├── index.js            # Server entry point
│   └── package.json
└── DATABASE_INIT.md        # SQL initialization script
```

---

## Access Points

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Main website |
| http://localhost:5173/admin/login | Admin panel login |
| http://localhost:5000/api | Backend API |

### Default Admin Login
- **Email:** admin@petadopt.com
- **Password:** admin123

---

## Common Issues

### "Cannot find module" error
Run `yarn install` in both `client/` and `server/` folders.

### Database connection error
- Check MySQL is running
- Verify `.env` credentials match your MySQL setup
- Ensure the database exists (run SQL from DATABASE_INIT.md)

### Port already in use
- Backend: Change `PORT` in `.env`
- Frontend: Vite will auto-select another port

---

## Tech Stack

- **Frontend:** React, Vite, React Router, Axios
- **Backend:** Express.js, MySQL2, JWT, bcryptjs
- **Database:** MySQL
