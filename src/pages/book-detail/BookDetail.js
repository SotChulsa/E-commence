import React from 'react';
import bookCover from '../../new-book.svg';

const toCurrency = (value) => {
  if (typeof value !== 'number') {
    return 'Price unavailable';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const BookDetail = ({
  activeDetailBook,
  handleAddToCart,
  addingBookId,
  wishlistBookIds,
  toggleWishlist,
  detailRecommendations,
  openBookDetail,
  setActiveView,
}) => (
  <main className="book-detail-view">
    <button
      type="button"
      className="back-home-link"
      onClick={() => setActiveView('home')}
    >
      Back to home
    </button>
    <section className="book-detail-card">
      <img src={activeDetailBook?.image || bookCover} alt={activeDetailBook?.title || 'Book'} />
      <div className="book-detail-content">
        <span className="featured-badge">{activeDetailBook?.genre || 'Featured'}</span>
        <h2>{activeDetailBook?.title || 'Untitled'}</h2>
        <p className="hero-author">by {activeDetailBook?.author || 'Unknown author'}</p>
        <p className="book-detail-rating">Rating 4.8 out of 5</p>
        <div className="book-detail-divider" />
        <h4>Description</h4>
        <p>{activeDetailBook?.description || 'No description available yet.'}</p>
        <div className="book-detail-divider" />
        <div className="book-detail-price-row">
          <p className="book-detail-price">{toCurrency(activeDetailBook?.price)}</p>
          <p className="book-detail-compare">{toCurrency((activeDetailBook?.price || 0) * 1.35)}</p>
        </div>
        <div className="book-detail-actions">
          <button
            type="button"
            onClick={() => handleAddToCart(activeDetailBook?._id)}
            disabled={addingBookId === activeDetailBook?._id}
          >
            {addingBookId === activeDetailBook?._id ? 'Adding...' : 'Add to Cart'}
          </button>
          <button
            type="button"
            className={`wishlist-btn ${wishlistBookIds.includes(activeDetailBook?._id) ? 'active' : ''}`}
            onClick={() => toggleWishlist(activeDetailBook?._id)}
            aria-label={wishlistBookIds.includes(activeDetailBook?._id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <span className="heart-glyph" aria-hidden="true">♡</span>
          </button>
        </div>

        <div className="book-detail-benefits">
          <article>
            <strong>In Stock</strong>
            <p>Ships immediately</p>
          </article>
          <article>
            <strong>Free Shipping</strong>
            <p>Orders over $50</p>
          </article>
          <article>
            <strong>Easy Returns</strong>
            <p>30-day return policy</p>
          </article>
        </div>

        <section className="book-detail-facts">
          <h4>Product Details</h4>
          <div className="facts-grid">
            <p>Format:</p><p>Hardcover</p>
            <p>Publisher:</p><p>Digipaper Publishing</p>
            <p>Language:</p><p>English</p>
            <p>ISBN:</p><p>978-9278091382</p>
          </div>
        </section>
      </div>
    </section>

    <section className="book-detail-more">
      <h3>Want more?</h3>
      <p>Check out these other amazing books</p>
      <div className="book-detail-reco-grid">
        {detailRecommendations.map((item) => (
          <article
            key={item._id}
            className="book-detail-reco-card"
            role="button"
            tabIndex={0}
            onClick={() => openBookDetail(item)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openBookDetail(item);
              }
            }}
          >
            <button
              type="button"
              className={`book-detail-reco-heart ${wishlistBookIds.includes(item._id) ? 'active' : ''}`}
              onClick={(event) => {
                event.stopPropagation();
                toggleWishlist(item._id);
              }}
              aria-label={wishlistBookIds.includes(item._id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <span className="heart-glyph" aria-hidden="true">♡</span>
            </button>
            <img src={item.image || bookCover} alt={item.title || 'Book'} />
            <div className="book-detail-reco-meta">
              <h4>{item.title || 'Untitled'}</h4>
              <p>{item.author || 'Unknown author'}</p>
              <div>
                <span>{toCurrency(item.price)}</span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAddToCart(item._id);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  </main>
);

export default BookDetail;