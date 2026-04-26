import React, { useMemo, useState, useEffect } from 'react';
import { getBooks, deleteBook, getAdminOrders, updateAdminOrderStatus } from '../../api';
import './AdminDashboard.css';

const ALLOWED_ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const RECENT_ORDER_LIMIT = 10;

const getOrderCreatedAtTime = (order) => {
  const createdAtTime = new Date(order?.createdAt || 0).getTime();
  if (Number.isFinite(createdAtTime) && createdAtTime > 0) {
    return createdAtTime;
  }

  const rawId = String(order?._id || '');
  if (/^[a-fA-F0-9]{24}$/.test(rawId)) {
    return parseInt(rawId.slice(0, 8), 16) * 1000;
  }

  return 0;
};

const AdminDashboard = ({ adminStats, adminStatsLoading, adminStatsError, setActiveView, accessToken, withTokenRefresh, showUiMessage, usingMockCatalog, onBookDeleted }) => {
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [orderStatusDrafts, setOrderStatusDrafts] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [showOlderOrders, setShowOlderOrders] = useState(false);

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

  useEffect(() => {
    const loadOrders = async () => {
      if (!accessToken || !withTokenRefresh) {
        setOrders([]);
        setOrdersLoading(false);
        setOrdersError('');
        return;
      }

      setOrdersLoading(true);
      setOrdersError('');
      try {
        const data = await withTokenRefresh((token) => getAdminOrders(token));
        const normalized = Array.isArray(data) ? data : [];
        setOrders(normalized);
        setOrderStatusDrafts(
          normalized.reduce((acc, order) => {
            const nextStatus = String(order?.status || 'pending').toLowerCase();
            acc[order?._id] = ALLOWED_ORDER_STATUSES.includes(nextStatus) ? nextStatus : 'pending';
            return acc;
          }, {})
        );
      } catch (error) {
        setOrdersError(error.message || 'Could not load orders.');
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [accessToken, withTokenRefresh]);

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

  const handleOrderDraftChange = (orderId, status) => {
    setOrderStatusDrafts((prev) => ({
      ...prev,
      [orderId]: status,
    }));
  };

  const handleUpdateOrderStatus = async (orderId) => {
    const nextStatus = String(orderStatusDrafts[orderId] || 'pending').trim();
    if (!nextStatus || !ALLOWED_ORDER_STATUSES.includes(nextStatus)) {
      showUiMessage('Please select a valid order status.', 'error');
      return;
    }

    setUpdatingOrderId(orderId);
    try {
      await withTokenRefresh((token) => updateAdminOrderStatus(token, orderId, nextStatus));
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: nextStatus,
              }
            : order
        )
      );
      showUiMessage('Order status updated successfully.', 'success');
    } catch (error) {
      showUiMessage(error.message || 'Could not update order status.', 'error');
    } finally {
      setUpdatingOrderId('');
    }
  };

  const getOrderCustomerLabel = (order) =>
    order?.buyerName || order?.shippingInfo?.name || order?.buyerEmail || order?.user || 'Unknown';

  const getOrderTotal = (order) => {
    const value = Number(order?.totalPrice ?? order?.total ?? 0);
    return Number.isFinite(value) ? value.toFixed(2) : '0.00';
  };

  const processedOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => getOrderCreatedAtTime(b) - getOrderCreatedAtTime(a));
    const normalizedQuery = orderSearchQuery.trim().toLowerCase();

    const filtered = !normalizedQuery
      ? sorted
      : sorted.filter((order) => {
          const customer = String(getOrderCustomerLabel(order) || '').toLowerCase();
          return customer.includes(normalizedQuery);
        });

    const hasOlder = filtered.length > RECENT_ORDER_LIMIT;
    const visible = showOlderOrders ? filtered : filtered.slice(0, RECENT_ORDER_LIMIT);

    return {
      visible,
      totalFiltered: filtered.length,
      hiddenCount: hasOlder && !showOlderOrders ? filtered.length - RECENT_ORDER_LIMIT : 0,
    };
  }, [orders, orderSearchQuery, showOlderOrders]);

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
                <th>Placement</th>
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
                    {Array.isArray(book.featureTags) && book.featureTags.length > 0
                      ? book.featureTags[0]
                      : 'Default'}
                  </td>
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

      <div className="section-title-row">
        <h3>Order Processing</h3>
      </div>
      <p className="section-note">Review incoming orders and update their processing status.</p>

      <div className="admin-order-toolbar">
        <input
          type="text"
          value={orderSearchQuery}
          onChange={(event) => setOrderSearchQuery(event.target.value)}
          placeholder="Search by customer name"
          aria-label="Search order by customer name"
        />
        <button
          type="button"
          onClick={() => setShowOlderOrders((prev) => !prev)}
          disabled={processedOrders.totalFiltered <= RECENT_ORDER_LIMIT}
        >
          {showOlderOrders ? 'Hide Older Orders' : `Show Older Orders (${processedOrders.hiddenCount})`}
        </button>
      </div>

      {processedOrders.totalFiltered > 0 ? (
        <p className="section-note">
          Showing {processedOrders.visible.length} of {processedOrders.totalFiltered} matching orders (newest first)
        </p>
      ) : null}

      {ordersLoading ? <p className="section-note">Loading admin orders...</p> : null}
      {ordersError ? <p className="section-note warning">{ordersError}</p> : null}

      {!ordersLoading && !ordersError && processedOrders.visible.length > 0 ? (
        <div className="books-table-container">
          <table className="books-table admin-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total ($)</th>
                <th>Current</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {processedOrders.visible.map((order) => {
                const orderId = order?._id;
                const isUpdating = updatingOrderId === orderId;
                const currentStatus = String(order?.status || 'pending').toLowerCase();
                const safeCurrentStatus = ALLOWED_ORDER_STATUSES.includes(currentStatus)
                  ? currentStatus
                  : 'pending';
                const draftValue = orderStatusDrafts[orderId] || safeCurrentStatus;

                return (
                  <tr key={orderId}>
                    <td>{orderId}</td>
                    <td>{getOrderCustomerLabel(order)}</td>
                    <td>{getOrderTotal(order)}</td>
                    <td>{safeCurrentStatus}</td>
                    <td>
                      <div className="admin-order-actions">
                        <select
                          value={draftValue}
                          onChange={(event) => handleOrderDraftChange(orderId, event.target.value)}
                          disabled={isUpdating}
                        >
                          <option value="pending">pending</option>
                          <option value="processing">processing</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">delivered</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => handleUpdateOrderStatus(orderId)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {!ordersLoading && !ordersError && processedOrders.visible.length === 0 ? (
        <p className="section-note">No matching orders found.</p>
      ) : null}

    </main>
  );
};

export default AdminDashboard;