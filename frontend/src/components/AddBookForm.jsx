import { useState, useEffect } from 'react';

export default function AddBookForm({ apiUrl, onSaved, editingBook, cancelEdit }) {
  const [form, setForm] = useState({ title: '', author: '', genre: '', isbn: '', quantity: 1 });

  useEffect(() => {
    if (editingBook) setForm(editingBook);
    else setForm({ title: '', author: '', genre: '', isbn: '', quantity: 1 });
  }, [editingBook]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.isbn) return alert('Fill in all required fields');

    const method = editingBook ? 'PUT' : 'POST';
    const url = editingBook ? `${apiUrl}/books/${editingBook.id}` : `${apiUrl}/books`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      setForm({ title: '', author: '', genre: '', isbn: '', quantity: 1 });
      if (cancelEdit) cancelEdit();
      onSaved();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to save book');
    }
  };

  return (
    <div className="card">
      <h3>{editingBook ? 'Update Book Details' : 'Add New Book'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <input placeholder="Book Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <input placeholder="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} required />
          <input placeholder="Genre" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} required />
          <input placeholder="ISBN" value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} required />
          <input type="number" min="0" placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
        </div>
        <button type="submit" className="btn-primary">{editingBook ? 'Save Changes' : 'Add Book'}</button>
        {editingBook && <button type="button" onClick={cancelEdit} className="btn-danger">Cancel</button>}
      </form>
    </div>
  );
}