import { useEffect, useState } from 'react';

export default function Dashboard({ apiUrl = 'http://localhost:5000' }) {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch(`${apiUrl}/books`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBooks(data);
        } else {
          setBooks([]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch books:", err);
        setBooks([]);
      });
  }, [apiUrl]);

  const lowStockCount = Array.isArray(books) ? books.filter(b => b.quantity < 2).length : 0;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Library Dashboard</h2>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f4f4f4', borderRadius: '5px', marginBottom: '20px' }}>
        <div>
          <h3>Total Books Cataloged</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{Array.isArray(books) ? books.length : 0}</p>
        </div>
        <div>
          <h3>Low Stock Items (2)</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: lowStockCount > 0 ? 'red' : 'green' }}>
            {lowStockCount}
          </p>
        </div>
      </div>

      <h3>Available Books</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }} border="1">
        <thead>
          <tr style={{ background: '#ddd' }}>
            <th style={{ padding: '8px' }}>Title</th>
            <th style={{ padding: '8px' }}>Author</th>
            <th style={{ padding: '8px' }}>Genre</th>
            <th style={{ padding: '8px' }}>ISBN</th>
            <th style={{ padding: '8px' }}>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(books) && books.length > 0 ? (
            books.map(book => (
              <tr key={book.id}>
                <td style={{ padding: '8px' }}>{book.title}</td>
                <td style={{ padding: '8px' }}>{book.author}</td>
                <td style={{ padding: '8px' }}>{book.genre}</td>
                <td style={{ padding: '8px' }}>{book.isbn}</td>
                <td style={{ padding: '8px' }}>{book.quantity}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>No books found or connecting to server...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}