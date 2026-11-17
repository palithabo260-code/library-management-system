import { useEffect, useState } from 'react';
import AddBookForm from './AddBookForm';

export default function BookList({ apiUrl }) {
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);

  const loadBooks = () => {
    fetch(`${apiUrl}/books`).then(res => res.json()).then(setBooks);
  };

  useEffect(() => { loadBooks(); }, [apiUrl]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    await fetch(`${apiUrl}/books/${id}`, { method: 'DELETE' });
    loadBooks();
  };

  return (
    <div>
      <AddBookForm apiUrl={apiUrl} onSaved={loadBooks} editingBook={editingBook} cancelEdit={() => setEditingBook(null)} />
      <div className="card">
        <h3>Manage Books</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Genre</th>
              <th>ISBN</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(b => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.genre}</td>
                <td>{b.isbn}</td>
                <td>{b.quantity}</td>
                <td>
                  <button className="btn-warning" onClick={() => setEditingBook(b)}>Update</button>
                  <button className="btn-danger" onClick={() => handleDelete(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}