import { useEffect, useState } from 'react';

export default function Transactions({ apiUrl }) {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ book_id: '', user_id: '', type: 'BORROW', quantity: 1 });

  const loadAll = () => {
    fetch(`${apiUrl}/books`).then(r => r.json()).then(setBooks);
    fetch(`${apiUrl}/users`).then(r => r.json()).then(setUsers);
    fetch(`${apiUrl}/transactions`).then(r => r.json()).then(setHistory);
  };

  useEffect(() => { loadAll(); }, [apiUrl]);

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!form.book_id) return alert('Select a book');

    const res = await fetch(`${apiUrl}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (res.ok) {
      setForm({ ...form, quantity: 1 });
      loadAll();
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      <div className="card">
        <h3>Record Stock / Borrowing Transaction</h3>
        <form onSubmit={handleTransaction}>
          <div className="form-grid">
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="BORROW">Deduct Stock (Borrow Book)</option>
              <option value="ADD_STOCK">Add Stock (New Arrival)</option>
            </select>

            <select value={form.book_id} onChange={e => setForm({ ...form, book_id: e.target.value })} required>
              <option value="">-- Select Book --</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title} (Stock: {b.quantity})</option>
              ))}
            </select>

            {form.type === 'BORROW' && (
              <select value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })} required>
                <option value="">-- Select Member --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>
                ))}
              </select>
            )}

            <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
          </div>
          <button type="submit" className={form.type === 'ADD_STOCK' ? 'btn-success' : 'btn-primary'}>
            {form.type === 'ADD_STOCK' ? 'Add Stock' : 'Confirm Borrow'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Transaction History Log</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Book</th>
              <th>Member</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {history.map(t => (
              <tr key={t.id}>
                <td>{new Date(t.created_at).toLocaleString()}</td>
                <td>{t.type === 'ADD_STOCK' ? 'Stock Added' : 'Borrowed'}</td>
                <td>{t.book_title}</td>
                <td>{t.user_name || 'N/A (Restock)'}</td>
                <td>{t.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}