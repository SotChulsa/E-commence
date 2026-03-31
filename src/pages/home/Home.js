import React from 'react';
import BookCard from '../../components/BookCard';

const toCurrency = (value) => {
  if (typeof value !== 'number') {
    return 'Price unavailable';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const Home = ({
  trendingBook,
  openBookDetail,
  featuredBooks,
  featuredIndex,
  setFeaturedIndex,
  wishlistBookIds,
  toggleWishlist,
  handleAddToCart,
  addingBookId,
  categoryTabs,
  selectedCategoryTab,
  setSelectedCategoryTab,
  setSelectedGenre,
  booksLoading,
  booksError,
  usingMockCatalog,
  books,
  topSellers,
  recommended,
  uiMessage,
  uiMessageType,
  user,
  priceDrafts,
  setPriceDrafts,
  handleUpdateBookPrice,
  updatingPriceBookId,
}) => {
  return (
    <main className="home-view fade-in-anim">
      <section
        className="hero-panel clickable"
        onClick={() => openBookDetail(trendingBook)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openBookDetail(trendingBook);
          }
        }}
        aria-label={`Open details for ${trendingBook?.title || 'featured book'}`}
      >
        {trendingBook?.image ? (
          <img
            key={`hero-image-${trendingBook?._id || featuredIndex}`}
            className="hero-img-anim"
            src={trendingBook.image}
            alt={trendingBook?.title || 'Featured book'}
          />
        ) : (
          <div className="hero-image-placeholder" aria-hidden="true" />
        )}
        <div key={`hero-content-${trendingBook?._id || featuredIndex}`} className="hero-content">
          <span className="featured-badge hero-stagger hero-stagger-0">Featured Book</span>
          <h2 className="hero-stagger hero-stagger-1">{trendingBook?.title || 'Book Spotlight'}</h2>
          <p className="hero-author hero-stagger hero-stagger-2">by {trendingBook?.author || 'Unknown author'}</p>
          <p className="hero-stagger hero-stagger-3">{trendingBook?.description || 'Curated title for today.'}</p>
          <div className="hero-actions hero-stagger hero-stagger-4">
            <strong>{toCurrency(trendingBook?.price)}</strong>
            <button
              className="animated-btn hero-cart-btn"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleAddToCart(trendingBook?._id);
              }}
              disabled={addingBookId === trendingBook?._id}
            >
              {addingBookId === trendingBook?._id ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              className={`wishlist-btn ${wishlistBookIds.includes(trendingBook?._id) ? 'active' : ''}`}
              type="button"
              aria-label={wishlistBookIds.includes(trendingBook?._id) ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={(event) => {
                event.stopPropagation();
                toggleWishlist(trendingBook?._id);
              }}
            >
              <span className="heart-glyph" aria-hidden="true">♡</span>
            </button>
          </div>
          <div className="hero-dots" role="tablist" aria-label="Featured book navigation">
            {featuredBooks.map((book, index) => {
              const isActive = index === featuredIndex;
              return (
                <button
                  key={book._id || `${book.title}-${index}`}
                  type="button"
                  role="tab"
                  className={`hero-dot ${isActive ? 'active' : ''}`}
                  aria-selected={isActive}
                  aria-label={`Show ${book.title || 'featured book'}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setFeaturedIndex(index);
                  }}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section className="category-row" aria-label="Book categories">
        {categoryTabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`category-pill ${selectedCategoryTab === tab.label ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategoryTab(tab.label);
              setSelectedGenre(tab.genre);
            }}
          >
            {tab.label}
          </button>
        ))}
      </section>

      <section className="books-section">
        <div className="section-title-row">
          <h3>Top Seller</h3>
        </div>

        <div className="books-grid fade-in-anim">
          {booksLoading ? <p className="section-note">Loading books...</p> : null}
          {booksError ? <p className="section-note warning">{booksError}</p> : null}
          {!booksLoading && !usingMockCatalog && books.length === 0 ? (
            <p className="section-note warning">No books in backend yet. Create books first to enable Add to Cart.</p>
          ) : null}
          {!booksLoading && topSellers.length === 0 ? (
            <p className="section-note">No books found for this filter.</p>
          ) : null}
          {!booksLoading ? topSellers.map((item) => (
            <BookCard
              key={item._id}
              item={item}
              openBookDetail={openBookDetail}
              handleAddToCart={handleAddToCart}
              addingBookId={addingBookId}
              wishlistBookIds={wishlistBookIds}
              toggleWishlist={toggleWishlist}
              user={user}
              priceDrafts={priceDrafts}
              setPriceDrafts={setPriceDrafts}
              handleUpdateBookPrice={handleUpdateBookPrice}
              updatingPriceBookId={updatingPriceBookId}
            />
          )) : null}
        </div>
      </section>

      <section className="books-section">
        <div className="section-title-row">
          <h3>Recommended For You</h3>
        </div>
        <div className="books-grid fade-in-anim">
          {!booksLoading ? recommended.map((item) => (
            <BookCard
              key={item._id}
              item={item}
              openBookDetail={openBookDetail}
              handleAddToCart={handleAddToCart}
              addingBookId={addingBookId}
              wishlistBookIds={wishlistBookIds}
              toggleWishlist={toggleWishlist}
              user={user}
              priceDrafts={priceDrafts}
              setPriceDrafts={setPriceDrafts}
              handleUpdateBookPrice={handleUpdateBookPrice}
              updatingPriceBookId={updatingPriceBookId}
            />
          )) : null}
        </div>
      </section>

      {uiMessage ? (
        <div className={`floating-message ${uiMessageType}`} role="status" aria-live="polite">
          <span className="toast-indicator" aria-hidden="true" />
          <span>{uiMessage}</span>
        </div>
      ) : null}
    </main>
  );
};

export default Home;