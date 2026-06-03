# 🏫 Greenfield Academy – School Online Admission System

A full-featured school admission management system built with **Express.js**, **Pug**, **Sequelize**, and **MySQL2**.

---

## Features

### Student Portal
- Multi-step application form with 4 sections
- Student information (name, DOB, gender, country, citizenship, religion, languages)
- Previous school details (optional)
- Parent/guardian details (mother & father)
- Emergency contact
- Medical history (allergies, sightless, disabilities)
- Application status tracking by application number

### Admin Panel
- Secure login with session management
- Dashboard with stat cards: Total students, New (pending) applications, Approved, Rejected
- Student list with search & filter by status
- Full student profile view
- Edit any student record
- Approve / Reject applications
- Delete student records
- **Auto email to parent upon approval** (via Nodemailer/SMTP)
- Pagination

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Server | Express.js 4.x |
| Views | Pug (template engine) |
| ORM | Sequelize 6.x |
| Database | MySQL (mysql2 driver) |
| Email | Nodemailer |
| Sessions | express-session |
| Styling | Custom CSS (no framework) |

---

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- MySQL 8.x running locally

### 2. Create the database
```sql
CREATE DATABASE school_admission CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Install dependencies
```bash
cd school-admission
npm install
```

### 4. Configure environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
SESSION_SECRET=change_this_to_a_random_string

DB_HOST=localhost
DB_PORT=3306
DB_NAME=school_admission
DB_USER=root
DB_PASS=your_mysql_password

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password     # Use Gmail App Password, not account password
SCHOOL_NAME=Greenfield Academy

ADMIN_EMAIL=admin@school.com
ADMIN_PASSWORD=Admin@1234
```

### 5. Start the server
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

The app will:
- Connect to MySQL
- Auto-create tables via Sequelize
- Seed a default admin account on first run

---

## Access

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Student portal homepage |
| `http://localhost:3000/apply` | Admission application form |
| `http://localhost:3000/status` | Check application status |
| `http://localhost:3000/admin/login` | Admin panel login |

### Default Admin Credentials
```
Email:    admin@school.com
Password: Admin@1234
```
> ⚠️ Change these in `.env` before deploying to production!

---

## Gmail SMTP Setup
1. Enable 2-Step Verification on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate a password for "Mail" → use it as `SMTP_PASS`

---

## Project Structure

```
school-admission/
├── app.js                  # Entry point
├── .env.example            # Environment template
├── config/
│   ├── database.js         # Sequelize connection
│   └── mailer.js           # Nodemailer email service
├── models/
│   ├── Admin.js            # Admin model
│   └── Student.js          # Student model
├── routes/
│   ├── admin.js            # Admin routes
│   └── student.js          # Public routes
├── middleware/
│   └── auth.js             # Session auth middleware
├── views/
│   ├── layout.pug          # Public base layout
│   ├── admin-layout.pug    # Admin base layout
│   ├── student/
│   │   ├── home.pug
│   │   ├── apply.pug
│   │   ├── success.pug
│   │   └── status.pug
│   └── admin/
│       ├── login.pug
│       ├── dashboard.pug
│       ├── students.pug
│       ├── student-view.pug
│       └── student-edit.pug
└── public/
    ├── css/
    │   ├── public.css
    │   └── admin.css
    └── js/
        ├── public.js
        └── admin.js
```
