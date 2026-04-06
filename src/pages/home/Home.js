import React, { useState } from 'react';
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

const BookCarousel = ({
  title,
  books,
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
  booksPerView = 4
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + booksPerView >= books.length ? 0 : prevIndex + booksPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - booksPerView < 0 ? Math.max(0, books.length - booksPerView) : prevIndex - booksPerView
    );
  };

  const totalPages = Math.ceil(books.length / booksPerView);
  const currentPage = Math.floor(currentIndex / booksPerView) + 1;

  if (books.length === 0) return null;

  return (
    <section className="books-section">
      <div className="section-title-row">
        <h3>{title}</h3>
        {books.length > booksPerView && (
          <div className="carousel-controls">
            <button
              type="button"
              className="carousel-arrow carousel-arrow-prev"
              onClick={prevSlide}
              disabled={currentIndex === 0}
              aria-label="Previous books"
            >
              ‹
            </button>
            <span className="carousel-page-indicator">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="carousel-arrow carousel-arrow-next"
              onClick={nextSlide}
              disabled={currentIndex + booksPerView >= books.length}
              aria-label="Next books"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="books-carousel fade-in-anim">
        <div className="books-carousel-track" style={{ transform: `translateX(-${currentIndex * (100 / booksPerView)}%)` }}>
          {books.map((item) => (
            <div key={item._id} className="book-carousel-item">
              <BookCard
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
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
  trendingBooks,
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

      <BookCarousel
        title="Trending Now"
        books={trendingBooks}
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

      <BookCarousel
        title="Top Sellers"
        books={topSellers}
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

      <BookCarousel
        title="Recommended For You"
        books={recommended}
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

      <BookCarousel
        title="New Arrivals"
        books={books.slice(0, 12)} // Show first 12 books as new arrivals
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

      <BookCarousel
        title="Bestsellers"
        books={books.slice(4, 16)} // Show books 5-16 as bestsellers
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