import React, { useState } from 'react';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [membershipId, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membership_id: membershipId, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Pass logged-in user data back up to App.jsx
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e293b' }}>Library System Login</h2>
      
      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Membership ID</label>
          <input 
            type="text" 
            value={membershipId} 
            onChange={(e) => setMembershipId(e.target.value)} 
            placeholder="e.g. ADM001 or MEM101" 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter password" 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          Login
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
        New member? <button onClick={onNavigateToRegister} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>Create an account</button>
      </div>
    </div>
  );
}