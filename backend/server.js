const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Get all books
app.get('/books', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM books');
    res.json(results);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Add a book
app.post('/books', async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    const query = 'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)';
    const [results] = await db.query(query, [title, author, genre, isbn, quantity]);
    res.json({ message: 'Book added successfully', id: results.insertId });
  } catch (err) {
    console.error('Error adding book:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Update a book
app.put('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, genre, isbn, quantity } = req.body;
    const query = 'UPDATE books SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ? WHERE id = ?';
    await db.query(query, [title, author, genre, isbn, quantity, id]);
    res.json({ message: 'Book updated successfully' });
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Delete a book
app.delete('/books/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Get all users (includes password for admin management)
app.get('/users', async (req, res) => {
  try {
    const [results] = await db.query('SELECT id, name, membership_id, password, role FROM users');
    res.json(results);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Add a new user/admin (Registration)
app.post('/users', async (req, res) => {
  try {
    const { name, membership_id, password, role } = req.body;
    const query = 'INSERT INTO users (name, membership_id, password, role) VALUES (?, ?, ?, ?)';
    const [results] = await db.query(query, [name, membership_id, password, role || 'member']);
    res.json({ message: 'User added successfully', id: results.insertId });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ error: err.message });
  }
});

// 7. Update a user (Admin power to update name, membership ID, password, and role)
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, membership_id, password, role } = req.body;
    const query = 'UPDATE users SET name = ?, membership_id = ?, password = ?, role = ? WHERE id = ?';
    await db.query(query, [name, membership_id, password, role, id]);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: err.message });
  }
});

// 8. Delete a user
app.delete('/users/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: err.message });
  }
});

// 9. Get all transactions
app.get('/transactions', async (req, res) => {
  try {
    const query = `
      SELECT t.*, b.title as book_title, u.name as user_name 
      FROM transactions t 
      LEFT JOIN books b ON t.book_id = b.id 
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `;
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: err.message });
  }
});

// 10. Record a transaction (Borrow / Return with stock recalculation)
app.post('/transactions', async (req, res) => {
  try {
    const { book_id, user_id, type, quantity } = req.body;
    const qty = parseInt(quantity, 10) || 1;

    const [books] = await db.query('SELECT quantity FROM books WHERE id = ?', [book_id]);
    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const isBorrow = type && (type.toLowerCase().includes('deduct') || type.toLowerCase().includes('borrow'));

    if (isBorrow && books[0].quantity < qty) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    const insertQuery = 'INSERT INTO transactions (book_id, user_id, type, quantity) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(insertQuery, [book_id, user_id || null, type, qty]);

    const updateQuery = isBorrow
      ? 'UPDATE books SET quantity = quantity - ? WHERE id = ?'
      : 'UPDATE books SET quantity = quantity + ? WHERE id = ?';
    await db.query(updateQuery, [qty, book_id]);

    res.json({ message: 'Transaction recorded successfully', id: result.insertId });
  } catch (err) {
    console.error('Error recording transaction:', err);
    res.status(500).json({ error: err.message });
  }
});

// 11. User Login Route
app.post('/login', async (req, res) => {
  try {
    const { membership_id, password } = req.body;
    
    const [users] = await db.query(
      'SELECT id, name, membership_id, password, role FROM users WHERE membership_id = ? AND password = ?', 
      [membership_id, password]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid Membership ID or Password' });
    }

    res.json({ message: 'Login successful', user: users[0] });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});