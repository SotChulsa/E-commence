import React from 'react';
import bookCover from '../new-book.svg';

const toCurrency = (value) => {
  if (typeof value !== 'number') {
    return 'Price unavailable';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const BookCard = ({
  item,
  openBookDetail,
  handleAddToCart,
  addingBookId,
  wishlistBookIds,
  toggleWishlist,
  user,
  priceDrafts,
  setPriceDrafts,
  handleUpdateBookPrice,
  updatingPriceBookId,
}) => (
  <article
    key={item._id}
    className="book-card clickable"
    role="button"
    tabIndex={0}
    onClick={() => openBookDetail(item)}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openBookDetail(item);
      }
    }}
    aria-label={`Open details for ${item.title || 'book'}`}
  >
    <img src={item.image || bookCover} alt={item.title || 'Book'} />
    <div className="book-meta">
      <h3>{item.title || 'Untitled'}</h3>
      <p>{item.author || 'Unknown author'}</p>
      <div className="book-row">
        <h4>{toCurrency(item.price)}</h4>
        <div className="book-row-actions">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleAddToCart(item._id);
            }}
            disabled={addingBookId === item._id}
          >
            {addingBookId === item._id ? 'Adding...' : 'Add to Cart'}
          </button>
          <button
            type="button"
            className={`book-wishlist-btn ${wishlistBookIds.includes(item._id) ? 'active' : ''}`}
            aria-label={wishlistBookIds.includes(item._id) ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={(event) => {
              event.stopPropagation();
              toggleWishlist(item._id);
            }}
          >
            <span className="heart-glyph" aria-hidden="true">♡</span>
          </button>
        </div>
      </div>
      {user?.role === 'admin' ? (
        <div
          className="admin-price-editor"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <label htmlFor={`price-${item._id}`}>Edit Price</label>
          <div className="admin-price-row">
            <input
              id={`price-${item._id}`}
              type="number"
              step="0.01"
              min="0"
              value={priceDrafts[item._id] ?? ''}
              onChange={(event) =>
                setPriceDrafts((current) => ({ ...current, [item._id]: event.target.value }))
              }
            />
            <button
              type="button"
              onClick={() => handleUpdateBookPrice(item._id)}
              disabled={updatingPriceBookId === item._id}
            >
              {updatingPriceBookId === item._id ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  </article>
);

export default BookCard;