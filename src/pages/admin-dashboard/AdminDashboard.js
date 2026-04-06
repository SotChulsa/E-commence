import React, { useMemo, useState, useEffect } from 'react';
import { getBooks, deleteBook } from '../../api';

const AdminDashboard = ({ adminStats, adminStatsLoading, adminStatsError, setActiveView, accessToken, withTokenRefresh, showUiMessage, usingMockCatalog, onBookDeleted }) => {
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState('');

  useEffect(() => {
    const loadBooks = async () => {
      setBooksLoading(true);
      setBooksError('');
      try {
        const data = await getBooks();
        setBooks(Array.isArray(data) ? data : []);
      } catch (error) {
        setBooksError(error.message || 'Could not load books.');
        setBooks([]);
      } finally {
        setBooksLoading(false);
      }
    };

    loadBooks();
  }, []);

  const adminStatCards = useMemo(
    () => [
      { label: 'Total Orders', value: adminStats?.totalOrders ?? 0 },
      { label: 'New Orders', value: adminStats?.newOrders ?? 0 },
      { label: 'Delivered', value: adminStats?.deliveredOrders ?? 0 },
      { label: 'Cancelled', value: adminStats?.cancelledOrders ?? 0 },
      { label: 'Books', value: adminStats?.totalBooks ?? 0 },
      { label: 'Users', value: adminStats?.totalUsers ?? 0 },
    ],
    [adminStats]
  );

  const handleEditBook = (book) => {
    setActiveView('edit-book', { book });
  };

  const handleDeleteBook = async (bookId, bookTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`)) {
      return;
    }

    if (usingMockCatalog) {
      // For mock data, delete locally and update global app state
      setBooks(prevBooks => prevBooks.filter(book => book._id !== bookId));
      if (onBookDeleted) {
        onBookDeleted(bookId);
      }
      showUiMessage('Book deleted successfully!', 'success');
      return;
    }

    try {
      await withTokenRefresh((token) => deleteBook(token, bookId));
      setBooks(prevBooks => prevBooks.filter(book => book._id !== bookId));
      if (onBookDeleted) {
        await onBookDeleted(bookId);
      }
      showUiMessage('Book deleted successfully!', 'success');
    } catch (error) {
      if (error.status === 404) {
        showUiMessage('Delete functionality not available on this backend. Please contact administrator.', 'error');
      } else {
        showUiMessage(error.message || 'Could not delete book.', 'error');
      }
    }
  };

  return (
    <main className="admin-dashboard-view fade-in-anim">
      <div className="section-title-row">
        <h3>Admin Dashboard</h3>
      </div>
      <p className="section-note">Live operational snapshot from backend.</p>

      {adminStatsLoading ? <p className="section-note">Loading dashboard stats...</p> : null}
      {adminStatsError ? <p className="section-note warning">{adminStatsError}</p> : null}

      <div className="admin-stats-grid">
        {adminStatCards.map((card) => (
          <article key={card.label} className="admin-stat-card">
            <h4>{card.label}</h4>
            <p>{card.value}</p>
          </article>
        ))}
      </div>

      <div className="section-title-row">
        <h3>Book Management</h3>
      </div>

      {booksLoading ? <p className="section-note">Loading books...</p> : null}
      {booksError ? <p className="section-note warning">{booksError}</p> : null}

      {!booksLoading && !booksError && books.length > 0 ? (
        <div className="books-table-container">
          <table className="books-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.genre}</td>
                  <td>${book.price?.toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => handleEditBook(book)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDeleteBook(book._id, book.title)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!booksLoading && !booksError && books.length === 0 ? (
        <p className="section-note">No books found.</p>
      ) : null}

      <div className="profile-actions">
        <button type="button" onClick={() => setActiveView('add-book')}>Add New Book</button>
        <button type="button" onClick={() => setActiveView('home')}>Back to Home</button>
      </div>
    </main>
  );
};

export default AdminDashboard;