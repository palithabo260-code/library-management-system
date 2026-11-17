CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  membership_id VARCHAR(50) UNIQUE NOT NULL,
  role ENUM('Admin', 'Member') DEFAULT 'Member',
  password VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  author VARCHAR(100) NOT NULL,
  genre VARCHAR(50) NOT NULL,
  isbn VARCHAR(30) UNIQUE NOT NULL,
  quantity INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT NULL,
  type ENUM('ADD_STOCK', 'BORROW') NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed Initial Admin & Sample Data
INSERT INTO users (name, membership_id, role, password) VALUES 
('System Admin', 'ADM001', 'Admin', 'admin123'),
('Thabo Mokoena', 'MEM101', 'Member', 'pass123');

INSERT INTO books (title, author, genre, isbn, quantity) VALUES 
('Clean Code', 'Robert C. Martin', 'Software Engineering', '978-0132350884', 5),
('Introduction to Algorithms', 'Thomas H. Cormen', 'Computer Science', '978-0262033848', 1);