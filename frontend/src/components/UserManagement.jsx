import { useEffect, useState } from 'react';

export default function UserManagement({ apiUrl, currentUser, onLogin }) {
  const [users, setUsers] = useState([]);
  const [loginData, setLoginData] = useState({ membership_id: '', password: '' });
  const [userForm, setUserForm] = useState({ name: '', membership_id: '', role: 'Member', password: '' });
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = () => {
    fetch(`${apiUrl}/users`).then(r => r.json()).then(setUsers);
  };

  useEffect(() => { loadUsers(); }, [apiUrl]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    const data = await res.json();
    if (res.ok) {
      onLogin(data);
      setLoginData({ membership_id: '', password: '' });
    } else {
      alert(data.error);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const method = editingUser ? 'PUT' : 'POST';
    const url = editingUser ? `${apiUrl}/users/${editingUser.id}` : `${apiUrl}/users`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm)
    });

    if (res.ok) {
      setUserForm({ name: '', membership_id: '', role: 'Member', password: '' });
      setEditingUser(null);
      loadUsers();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const startEdit = (u) => {
    setEditingUser(u);
    setUserForm({ name: u.name, membership_id: u.membership_id, role: u.role, password: '' });
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete user?')) return;
    await fetch(`${apiUrl}/users/${id}`, { method: 'DELETE' });
    loadUsers();
  };

  return (
    <div>
      {/* Login Form */}
      {!currentUser && (
        <div className="card">
          <h3>User Login</h3>
          <form onSubmit={handleLoginSubmit} className="form-grid">
            <input placeholder="Membership ID (e.g. ADM001)" value={loginData.membership_id} onChange={e => setLoginData({ ...loginData, membership_id: e.target.value })} required />
            <input type="password" placeholder="Password (e.g. admin123)" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} required />
            <button type="submit" className="btn-primary">Login</button>
          </form>
        </div>
      )}

      {/* Admin View: Add/Update/Delete Users */}
      <div className="card">
        <h3>{editingUser ? 'Update User' : 'Add New User (Admin Panel)'}</h3>
        <form onSubmit={handleUserSubmit}>
          <div className="form-grid">
            <input placeholder="Full Name" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required />
            <input placeholder="Membership ID" value={userForm.membership_id} onChange={e => setUserForm({ ...userForm, membership_id: e.target.value })} required />
            <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
            {!editingUser && (
              <input type="password" placeholder="Password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required />
            )}
          </div>
          <button type="submit" className="btn-primary">{editingUser ? 'Update User' : 'Add User'}</button>
          {editingUser && <button type="button" className="btn-danger" onClick={() => { setEditingUser(null); setUserForm({ name: '', membership_id: '', role: 'Member', password: '' }); }}>Cancel</button>}
        </form>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Membership ID</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.membership_id}</td>
                <td>{u.role}</td>
                <td>
                  <button className="btn-warning" onClick={() => startEdit(u)}>Update</button>
                  <button className="btn-danger" onClick={() => deleteUser(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}