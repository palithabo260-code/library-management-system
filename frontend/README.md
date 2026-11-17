# Library Management System

A full-stack web application built for managing library books, user accounts, membership roles, and book borrowing/returning transactions.

## 🚀 Features

* **Role-Based Access Control (RBAC):**
  * **Members:** Access to Dashboard (book catalog) and Transactions (borrowing/returning books for their own account).
  * **Admins:** Full control over Book Management (add, update, delete books), User Management (add, edit, view passwords, delete users), and recording transactions for any member.
* **Authentication & Authorization:** Secure login system supporting Membership ID and password verification, plus new member registration with validation pop-ups.
* **Inventory Management:** Real-time stock calculation that automatically deducts or restores book quantities when borrowing or returning items.
* **Transaction History Log:** Complete audit trail tracking dates, transaction types, book titles, members, and quantities.

## 🔑 Default Admin Credentials
## The admin is the only person who has power to access everything in this project 
* **Membership ID:** `ADM001` *( configured admin ID)*
* **Password:** `2014` *(configured password)*

## 🛠️ Tech Stack

* **Frontend:** React, Vite, JavaScript, HTML5, CSS3
* **Backend:** Node.js, Express.js
* **Database:** MySQL

## 📋 Database Schema Setup (`library_db`)

Ensure your MySQL database has the following tables configured:

1. **`users` Table:**
   - `id` (INT, Primary Key, Auto Increment)
   - `name` (VARCHAR)
   - `membership_id` (VARCHAR, Unique)
   - `password` (VARCHAR)
   - `role` (VARCHAR / Default: 'member')

2. **`books` Table:**
   - `id` (INT, Primary Key, Auto Increment)
   - `title` (VARCHAR)
   - `author` (VARCHAR)
   - `genre` (VARCHAR)
   - `isbn` (VARCHAR)
   - `quantity` (INT)

3. **`transactions` Table:**
   - `id` (INT, Primary Key, Auto Increment)
   - `book_id` (INT, Foreign Key)
   - `user_id` (INT, Foreign Key)
   - `type` (VARCHAR - e.g., 'Borrow' / 'Return')
   - `quantity` (INT)
   - `created_at` (TIMESTAMP)

## 🏃 How to Run Locally

1. **Clone the repository and set up MySQL database.**
2. **Start the Backend Server:**
   ```bash
   cd backend
   node server.js