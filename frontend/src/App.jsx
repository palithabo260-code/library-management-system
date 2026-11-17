import React, { useState, useEffect } from 'react';
import Login from './Login';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Form states
  const [newBook, setNewBook] = useState({ title: '', author: '', genre: '', isbn: '', quantity: 1 });
  const [editingBook, setEditingBook] = useState(null);
  const [borrowData, setBorrowData] = useState({ book_id: '', user_id: '', type: 'Borrow', quantity: 1 });
  const [newUser, setNewUser] = useState({ name: '', membership_id: '', password: '', role: 'member' });
  const [editingUser, setEditingUser] = useState(null);

  // Check if logged-in user is an Admin
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    if (currentUser) {
      fetchData();
      // If a regular member logs in, auto-select their own ID for transactions
      if (currentUser.role?.toLowerCase() !== 'admin') {
        setBorrowData(prev => ({ ...prev, user_id: currentUser.id }));
      }
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const booksRes = await fetch('http://localhost:5000/books');
      setBooks(await booksRes.json());

      const usersRes = await fetch('http://localhost:5000/users');
      setUsers(await usersRes.json());

      const txRes = await fetch('http://localhost:5000/transactions');
      setTransactions(await txRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // --- BOOK HANDLERS (ADMIN ONLY) ---
  const handleAddBook = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook)
    });
    setNewBook({ title: '', author: '', genre: '', isbn: '', quantity: 1 });
    fetchData();
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    await fetch(`http://localhost:5000/books/${editingBook.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingBook)
    });
    setEditingBook(null);
    fetchData();
  };

  const handleDeleteBook = async (id) => {
    if (confirm('Are you sure you want to delete this book?')) {
      await fetch(`http://localhost:5000/books/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  // --- TRANSACTION HANDLER ---
  const handleTransaction = async (e) => {
    e.preventDefault();
    const payload = {
      ...borrowData,
      user_id: isAdmin ? borrowData.user_id : currentUser.id
    };

    const res = await fetch('http://localhost:5000/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    fetchData();
  };

  // --- USER HANDLERS ---
  const handleRegisterUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();

      if (res.ok) {
        if (!currentUser) {
          alert('Account was made successfully! Please go back to login to your account.');
          setActiveTab('login');
        } else {
          alert('New user added successfully!');
        }
        setNewUser({ name: '', membership_id: '', password: '', role: 'member' });
      } else {
        alert(data.error || 'Error creating account. Membership ID might already exist.');
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
    fetchData();
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    await fetch(`http://localhost:5000/users/${editingUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingUser)
    });
    setEditingUser(null);
    fetchData();
  };

  const handleDeleteUser = async (id) => {
    if (confirm('Delete this user?')) {
      await fetch(`http://localhost:5000/users/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  // --- UNAUTHENTICATED VIEWS ---
  if (!currentUser) {
    if (activeTab === 'register') {
      return (
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
          <button onClick={() => setActiveTab('login')} style={{ marginBottom: '20px', padding: '8px 16px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← Back to Login</button>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px', color: '#1e293b', textAlign: 'center' }}>New Member Registration</h2>
            <form onSubmit={handleRegisterUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <input type="text" placeholder="Membership ID (e.g. MEM103)" value={newUser.membership_id} onChange={e => setNewUser({...newUser, membership_id: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Register Account</button>
            </form>
          </div>
        </div>
      );
    }
    return <Login onLoginSuccess={user => { setCurrentUser(user); setActiveTab('dashboard'); }} onNavigateToRegister={() => setActiveTab('register')} />;
  }

  const lowStockCount = books.filter(b => b.quantity <= 2).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* Navigation Bar */}
      <nav style={{ background: '#1e293b', color: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>Library System</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* Everyone sees Dashboard and Transactions */}
          <button onClick={() => setActiveTab('dashboard')} style={{ background: 'none', border: 'none', color: activeTab === 'dashboard' ? '#38bdf8' : '#fff', cursor: 'pointer', fontSize: '16px' }}>Dashboard</button>
          <button onClick={() => setActiveTab('transactions')} style={{ background: 'none', border: 'none', color: activeTab === 'transactions' ? '#38bdf8' : '#fff', cursor: 'pointer', fontSize: '16px' }}>Transactions</button>
          
          {/* ONLY Admin sees Book Management and User Management */}
          {isAdmin && (
            <>
              <button onClick={() => setActiveTab('books')} style={{ background: 'none', border: 'none', color: activeTab === 'books' ? '#38bdf8' : '#fff', cursor: 'pointer', fontSize: '16px' }}>Book Management</button>
              <button onClick={() => setActiveTab('users')} style={{ background: 'none', border: 'none', color: activeTab === 'users' ? '#38bdf8' : '#fff', cursor: 'pointer', fontSize: '16px' }}>User Management</button>
            </>
          )}
          
          <div style={{ borderLeft: '1px solid #475569', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
              Hi, {currentUser.name} ({isAdmin ? 'Admin' : 'Member'})
            </span>
            <button onClick={() => setCurrentUser(null)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* DASHBOARD VIEW (ALL USERS) */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <h4>Total Books Cataloged</h4>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>{books.length}</p>
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <h4>Low Stock Items</h4>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626' }}>{lowStockCount}</p>
              </div>
            </div>

            <h3 style={{ marginBottom: '15px' }}>Available Books</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Title</th>
                  <th style={{ padding: '12px' }}>Author</th>
                  <th style={{ padding: '12px' }}>Genre</th>
                  <th style={{ padding: '12px' }}>ISBN</th>
                  <th style={{ padding: '12px' }}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {books.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>{b.title}</td>
                    <td style={{ padding: '12px' }}>{b.author}</td>
                    <td style={{ padding: '12px' }}>{b.genre}</td>
                    <td style={{ padding: '12px' }}>{b.isbn}</td>
                    <td style={{ padding: '12px' }}>{b.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TRANSACTIONS VIEW (ALL USERS) */}
        {activeTab === 'transactions' && (
          <div>
            <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <h3>Record Stock / Borrowing Transaction</h3>
              <form onSubmit={handleTransaction} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <select value={borrowData.type} onChange={e => setBorrowData({...borrowData, type: e.target.value})} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                  <option value="Borrow">Deduct Stock (Borrow Book)</option>
                  <option value="Return">Add Stock (Return Book)</option>
                </select>
                <select value={borrowData.book_id} onChange={e => setBorrowData({...borrowData, book_id: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                  <option value="">Select Book</option>
                  {books.map(b => <option key={b.id} value={b.id}>{b.title} (Stock: {b.quantity})</option>)}
                </select>
                
                {/* Admin can choose any member; regular Members automatically borrow under their own account */}
                {isAdmin ? (
                  <select value={borrowData.user_id} onChange={e => setBorrowData({...borrowData, user_id: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                    <option value="">Select Member</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>)}
                  </select>
                ) : (
                  <input type="text" value={`${currentUser.name} (${currentUser.membership_id})`} disabled style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }} />
                )}

                <input type="number" min="1" value={borrowData.quantity} onChange={e => setBorrowData({...borrowData, quantity: e.target.value})} placeholder="Quantity" required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                <button type="submit" style={{ gridColumn: 'span 2', background: '#2563eb', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Confirm Transaction</button>
              </form>
            </div>

            <h3>Transaction History Log</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Type</th>
                  <th style={{ padding: '12px' }}>Book</th>
                  <th style={{ padding: '12px' }}>Member</th>
                  <th style={{ padding: '12px' }}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>{new Date(t.created_at).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>{t.type}</td>
                    <td style={{ padding: '12px' }}>{t.book_title || 'Unknown Book'}</td>
                    <td style={{ padding: '12px' }}>{t.user_name || 'Unknown User'}</td>
                    <td style={{ padding: '12px' }}>{t.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BOOK MANAGEMENT VIEW (ADMIN ONLY) */}
        {isAdmin && activeTab === 'books' && (
          <div>
            {editingBook ? (
              <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <h3>Update Book Details</h3>
                <form onSubmit={handleUpdateBook} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <input type="text" value={editingBook.title} onChange={e => setEditingBook({...editingBook, title: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <input type="text" value={editingBook.author} onChange={e => setEditingBook({...editingBook, author: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <input type="text" value={editingBook.genre} onChange={e => setEditingBook({...editingBook, genre: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <input type="text" value={editingBook.isbn} onChange={e => setEditingBook({...editingBook, isbn: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <input type="number" value={editingBook.quantity} onChange={e => setEditingBook({...editingBook, quantity: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Changes</button>
                    <button type="button" onClick={() => setEditingBook(null)} style={{ background: '#64748b', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <h3>Add New Book</h3>
                <form onSubmit={handleAddBook} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <input type="text" placeholder="Title" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <input type="text" placeholder="Author" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <input type="text" placeholder="Genre" value={newBook.genre} onChange={e => setNewBook({...newBook, genre: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <input type="text" placeholder="ISBN" value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <input type="number" placeholder="Quantity" value={newBook.quantity} onChange={e => setNewBook({...newBook, quantity: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <button type="submit" style={{ background: '#10b981', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Add Book</button>
                </form>
              </div>
            )}

            <h3>Book Catalog</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Title</th>
                  <th style={{ padding: '12px' }}>Author</th>
                  <th style={{ padding: '12px' }}>ISBN</th>
                  <th style={{ padding: '12px' }}>Quantity</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>{b.title}</td>
                    <td style={{ padding: '12px' }}>{b.author}</td>
                    <td style={{ padding: '12px' }}>{b.isbn}</td>
                    <td style={{ padding: '12px' }}>{b.quantity}</td>
                    <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                      <button onClick={() => setEditingBook(b)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDeleteBook(b.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* USER MANAGEMENT VIEW (ADMIN ONLY) */}
        {isAdmin && activeTab === 'users' && (
          <div>
            {editingUser ? (
              <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <h3>Edit User Details & Password</h3>
                <form onSubmit={handleUpdateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <input type="text" placeholder="Full Name" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <input type="text" placeholder="Membership ID" value={editingUser.membership_id} onChange={e => setEditingUser({...editingUser, membership_id: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <input type="text" placeholder="Password" value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Save User Changes</button>
                    <button type="button" onClick={() => setEditingUser(null)} style={{ background: '#64748b', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <h3>Add New User (Admin Panel)</h3>
                <form onSubmit={handleRegisterUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <input type="text" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <input type="text" placeholder="Membership ID" value={newUser.membership_id} onChange={e => setNewUser({...newUser, membership_id: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button type="submit" style={{ gridColumn: 'span 2', background: '#2563eb', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Add User</button>
                </form>
              </div>
            )}

            <h3>System Users & Passwords</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Membership ID</th>
                  <th style={{ padding: '12px' }}>Password</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>{u.name}</td>
                    <td style={{ padding: '12px' }}>{u.membership_id}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>{u.password}</td>
                    <td style={{ padding: '12px' }}>{u.role}</td>
                    <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                      <button onClick={() => setEditingUser(u)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDeleteUser(u.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}