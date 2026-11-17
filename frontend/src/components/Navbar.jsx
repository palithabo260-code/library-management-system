import { NavLink } from 'react-router-dom';

export default function Navbar({ currentUser, onLogout }) {
  return (
    <nav className="navbar">
      <div>
        <strong> Library System</strong>
        {currentUser && <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>({currentUser.name} - {currentUser.role})</span>}
      </div>
      <div className="nav-links">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/books">Book Management</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/users">User Management</NavLink>
        {currentUser && (
          <button onClick={onLogout} className="btn-danger" style={{ marginLeft: '1rem' }}>Logout</button>
        )}
      </div>
    </nav>
  );
}