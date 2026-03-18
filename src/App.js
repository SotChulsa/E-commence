import { useEffect, useMemo, useState } from 'react';
import './App.css';
import profile from './profile.svg';
import heart from './heart.svg';
import cart from './cart.svg';
import bookCover from './new-book.svg';
import { getBooks, loginUser, registerUser, verifyOtp } from './api';

const AUTH_STORAGE_KEY = 'digipaper_auth';
const CART_STORAGE_KEY = 'digipaper_cart';

const MOCK_BOOKS = [
  {
    _id: 'mock-1',
    title: 'I Want a Better Catastrophe',
    author: 'Andrew Boyd',
    description: 'A practical and emotional guide for navigating climate grief and action.',
    price: 21.5,
    genre: 'Nonfiction',
    image: bookCover,
  },
  {
    _id: 'mock-2',
    title: 'The Last Voyage',
    author: 'Nora Brent',
    description: 'A quiet ocean thriller with a sharp psychological twist.',
    price: 15.99,
    genre: 'Thriller',
    image: bookCover,
  },
  {
    _id: 'mock-3',
    title: 'Fire on Winter Street',
    author: 'Mason Creed',
    description: 'A high-stakes mystery set in an old industrial town.',
    price: 18.75,
    genre: 'Mystery',
    image: bookCover,
  },
  {
    _id: 'mock-4',
    title: 'Moonlight Theory',
    author: 'Lila Harper',
    description: 'A heartfelt romance between two rival academics.',
    price: 12.2,
    genre: 'Romance',
    image: bookCover,
  },
  {
    _id: 'mock-5',
    title: 'Signal Beyond Mars',
    author: 'Arun Vale',
    description: 'First contact fiction with grounded science and tense pacing.',
    price: 24.0,
    genre: 'Sci-Fi',
    image: bookCover,
  },
  {
    _id: 'mock-6',
    title: 'A House of Cedar',
    author: 'Mira Lang',
    description: 'A dark fantasy tale of family secrets and old magic.',
    price: 19.4,
    genre: 'Fantasy',
    image: bookCover,
  },
];

const toCurrency = (value) => {
  if (typeof value !== 'number') {
    return 'Price unavailable';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return {
        user: null,
        accessToken: '',
        refreshToken: '',
      };
    }

    const parsed = JSON.parse(raw);
    return {
      user: parsed.user || null,
      accessToken: parsed.accessToken || '',
      refreshToken: parsed.refreshToken || '',
    };
  } catch (_error) {
    return {
      user: null,
      accessToken: '',
      refreshToken: '',
    };
  }
};

const readStoredCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

function App() {
  const initialAuth = readStoredAuth();

  const [activeView, setActiveView] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [user, setUser] = useState(initialAuth.user);
  const [accessToken, setAccessToken] = useState(initialAuth.accessToken);
  const [refreshToken, setRefreshToken] = useState(initialAuth.refreshToken);

  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState('');

  const [cartItems, setCartItems] = useState(readStoredCart);

  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const [authMode, setAuthMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [uiMessage, setUiMessage] = useState('');

  useEffect(() => {
    const loadBooks = async () => {
      setBooksLoading(true);
      setBooksError('');
      try {
        const data = await getBooks();
        const list = Array.isArray(data) && data.length > 0 ? data : MOCK_BOOKS;
        setBooks(list);
      } catch (_error) {
        setBooks(MOCK_BOOKS);
        setBooksError('Using frontend mock catalog until backend is connected.');
      } finally {
        setBooksLoading(false);
      }
    };

    loadBooks();
  }, []);

  useEffect(() => {
    if (!user || !accessToken || !refreshToken) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ user, accessToken, refreshToken })
    );
  }, [user, accessToken, refreshToken]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const filteredBooks = useMemo(() => {
    let working = books.length > 0 ? books : MOCK_BOOKS;

    if (selectedGenre !== 'All') {
      working = working.filter((item) => (item.genre || 'Other') === selectedGenre);
    }

    const value = query.trim().toLowerCase();
    if (!value) {
      return working;
    }

    return working.filter((item) => {
      const title = (item.title || '').toLowerCase();
      const author = (item.author || '').toLowerCase();
      return title.includes(value) || author.includes(value);
    });
  }, [books, query, selectedGenre]);

  const trendingBook = filteredBooks[0] || MOCK_BOOKS[0];
  const topSellers = filteredBooks.slice(0, 4);
  const recommended =
    filteredBooks.slice(4, 8).length > 0 ? filteredBooks.slice(4, 8) : filteredBooks.slice(0, 4);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0),
    [cartItems]
  );

  const clearStatus = () => {
    setAuthError('');
    setAuthMessage('');
    setUiMessage('');
  };

  const openAuth = (mode = 'signin') => {
    clearStatus();
    setAuthMode(mode);
    setActiveView('auth');
    setIsDrawerOpen(false);
  };

  const addBookToLocalCart = (item) => {
    setCartItems((prev) => {
      const index = prev.findIndex((entry) => entry._id === item._id);
      if (index < 0) {
        return [...prev, { ...item, quantity: 1 }];
      }

      return prev.map((entry, i) =>
        i === index ? { ...entry, quantity: entry.quantity + 1 } : entry
      );
    });
  };

  const handleAddToCart = (bookId) => {
    const item = (books.length > 0 ? books : MOCK_BOOKS).find((entry) => entry._id === bookId);
    if (!item) {
      setUiMessage('Book is unavailable right now.');
      return;
    }

    addBookToLocalCart(item);
    setUiMessage('Added to cart.');
  };

  const handleRemoveFromCart = (bookId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== bookId));
  };

  const handleChangeQuantity = (bookId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item._id !== bookId) {
            return item;
          }

          return {
            ...item,
            quantity: Math.max(0, (item.quantity || 1) + delta),
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setAuthError('Email and password are required.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');

    try {
      const payload = await loginUser({ email, password });
      setUser({
        _id: payload._id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      });
      setAccessToken(payload.accessToken || 'local-access-token');
      setRefreshToken(payload.refreshToken || 'local-refresh-token');
      setAuthMessage('Logged in successfully.');
      setActiveView('home');
    } catch (_error) {
      setUser({
        _id: 'local-user',
        name: email.split('@')[0] || 'Reader',
        email,
        role: 'user',
      });
      setAccessToken('local-access-token');
      setRefreshToken('local-refresh-token');
      setAuthMessage('Frontend demo login completed.');
      setActiveView('home');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setAuthError('All sign up fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');

    try {
      await registerUser({ name, email, password });
      setAuthMessage('Account created. Enter your verification code.');
      setAuthMode('verify');
    } catch (_error) {
      setAuthMessage('Frontend demo registration completed.');
      setAuthMode('verify');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRecoveryRequest = () => {
    if (!recoveryEmail) {
      setAuthError('Please enter your email for recovery.');
      return;
    }

    setAuthError('');
    setAuthMessage('Recovery code requested. Check your email and continue to verification.');
    setEmail(recoveryEmail);
    setAuthMode('verify');
  };

  const handleVerifyOtp = async () => {
    if (!email || !verifyCode) {
      setAuthError('Email and code are required for verification.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');

    try {
      await verifyOtp({ email, otp: verifyCode });
      setAuthMessage('Verification successful. You can sign in now.');
      setAuthMode('signin');
    } catch (_error) {
      setAuthMessage('Frontend demo verification completed.');
      setAuthMode('signin');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken('');
    setRefreshToken('');
    setUiMessage('Logged out.');
  };

  const renderBookCard = (item) => (
    <article key={item._id} className="book-card">
      <img src={item.image || bookCover} alt={item.title || 'Book'} />
      <h3>{item.title || 'Untitled'}</h3>
      <p>{item.author || 'Unknown author'}</p>
      <h4>{toCurrency(item.price)}</h4>
      <button type="button" onClick={() => handleAddToCart(item._id)}>
        Add to Cart
      </button>
    </article>
  );

  return (
    <div className="app-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;700&family=Irish+Grover&family=Outfit:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="app-shell">
        {activeView !== 'auth' ? (
          <>
            <header className="app-header">
              <button type="button" className="logo-btn" onClick={() => setActiveView('home')}>
                Digipaper
              </button>

              <label className="search-box" aria-label="Search books">
                <span className="search-icon">&#128269;</span>
                <input
                  type="text"
                  placeholder="What are you looking for ?"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>

              <div className="header-actions">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => openAuth(user ? 'signin' : 'signin')}
                  aria-label="Profile"
                >
                  <img src={profile} alt="Profile" />
                </button>
                <button type="button" className="icon-btn" aria-label="Wishlist">
                  <img src={heart} alt="Wishlist" />
                </button>
                <button
                  type="button"
                  className="icon-btn cart-icon-btn"
                  onClick={() => setIsDrawerOpen(true)}
                  aria-label="Cart"
                >
                  <img src={cart} alt="Cart" />
                  <span>Cart ({cartCount})</span>
                </button>
              </div>
            </header>

            {activeView === 'home' ? (
              <main className="home-view">
                <section className="hero-panel">
                  <img src={trendingBook?.image || bookCover} alt={trendingBook?.title || 'Featured book'} />
                  <div className="hero-content">
                    <h2>{trendingBook?.title || 'Book Spotlight'}</h2>
                    <p>{trendingBook?.author || 'Unknown author'}</p>
                    <p>{trendingBook?.description || 'Curated title for today.'}</p>
                    <button type="button" onClick={() => handleAddToCart(trendingBook?._id)}>
                      Add to cart
                    </button>
                  </div>
                </section>

                <section className="books-section">
                  <div className="section-title-row">
                    <h3>Top Seller</h3>
                    <div className="genre-picker">
                      <select
                        value={selectedGenre}
                        onChange={(event) => setSelectedGenre(event.target.value)}
                        aria-label="Choose genre"
                      >
                        <option value="All">choose genre</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Romance">Romance</option>
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="Fantasy">Fantasy</option>
                        <option value="Horror">Horror</option>
                        <option value="Thriller">Thriller</option>
                        <option value="Mystery">Mystery</option>
                        <option value="Nonfiction">Nonfiction</option>
                      </select>
                    </div>
                  </div>

                  <div className="books-grid">
                    {booksLoading ? <p className="section-note">Loading books...</p> : null}
                    {booksError ? <p className="section-note warning">{booksError}</p> : null}
                    {!booksLoading && topSellers.length === 0 ? (
                      <p className="section-note">No books found for this filter.</p>
                    ) : null}
                    {!booksLoading ? topSellers.map(renderBookCard) : null}
                  </div>
                </section>

                <section className="books-section">
                  <div className="section-title-row">
                    <h3>Recommended For You</h3>
                  </div>
                  <div className="books-grid">
                    {!booksLoading ? recommended.map(renderBookCard) : null}
                  </div>
                </section>

                {uiMessage ? <p className="floating-message">{uiMessage}</p> : null}
              </main>
            ) : null}

            {activeView === 'cart-page' ? (
              <main className="cart-page">
                <h2>
                  <img src={cart} alt="cart" /> My Cart
                </h2>
                <div className="cart-table-head">
                  <span>Product</span>
                  <span>Price</span>
                  <span>Qty</span>
                  <span>Total</span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="empty-cart-box">Your cart is empty.</div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item._id} className="cart-line">
                      <div className="cart-product-col">
                        <img src={item.image || bookCover} alt={item.title || 'Book'} />
                        <div>
                          <strong>{item.title || 'Untitled'}</strong>
                          <p>{item.author || 'Unknown author'}</p>
                        </div>
                      </div>
                      <span>{toCurrency(item.price)}</span>
                      <div className="qty-box">
                        <button type="button" onClick={() => handleChangeQuantity(item._id, -1)}>
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => handleChangeQuantity(item._id, 1)}>
                          +
                        </button>
                      </div>
                      <div className="line-total-col">
                        <span>{toCurrency((item.price || 0) * (item.quantity || 0))}</span>
                        <button type="button" onClick={() => handleRemoveFromCart(item._id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <div className="cart-page-footer">
                  <p className="cart-total">Grand Total: {toCurrency(cartTotal)}</p>
                  <div>
                    <button type="button" onClick={() => setActiveView('home')}>
                      Shop More
                    </button>
                    <button type="button">Check Out</button>
                  </div>
                </div>
              </main>
            ) : null}

            <button
              type="button"
              className="fab-cart"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open cart drawer"
            >
              Cart ({cartCount})
            </button>
          </>
        ) : (
          <main className="auth-view">
            <button type="button" className="back-home-link" onClick={() => setActiveView('home')}>
              Back to home
            </button>

            <div className="auth-panels auth-single">
              {authMode === 'signin' ? (
                <article className="auth-card">
                  <h3>Sign in</h3>
                  <label>
                    Email
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </label>
                  <div className="toggle-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={(event) => setShowPassword(event.target.checked)}
                      />
                      Show password
                    </label>
                    <button type="button" className="inline-link" onClick={() => setAuthMode('recovery')}>
                      Forgot ?
                    </button>
                  </div>
                  <button type="button" onClick={handleSignIn} disabled={authLoading}>
                    Login
                  </button>
                  <div className="switch-auth-row">
                    <span>Do not have an account ?</span>
                    <button type="button" className="inline-link" onClick={() => setAuthMode('signup')}>
                      Register
                    </button>
                  </div>
                </article>
              ) : null}

              {authMode === 'signup' ? (
                <article className="auth-card">
                  <h3>Sign up</h3>
                  <label>
                    Name
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </label>
                  <label>
                    Confirm Password
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </label>
                  <div className="toggle-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={showConfirmPassword}
                        onChange={(event) => setShowConfirmPassword(event.target.checked)}
                      />
                      Show confirm password
                    </label>
                  </div>
                  <button type="button" onClick={handleSignUp} disabled={authLoading}>
                    Register
                  </button>
                  <div className="switch-auth-row">
                    <span>Already have an account ?</span>
                    <button type="button" className="inline-link" onClick={() => setAuthMode('signin')}>
                      Sign In
                    </button>
                  </div>
                </article>
              ) : null}

              {authMode === 'recovery' ? (
                <article className="auth-card">
                  <h3>Recovery</h3>
                  <label>
                    Email
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={recoveryEmail}
                      onChange={(event) => setRecoveryEmail(event.target.value)}
                    />
                  </label>
                  <button type="button" onClick={handleRecoveryRequest}>
                    Continue
                  </button>
                  <div className="switch-auth-row">
                    <span>Remember your password ?</span>
                    <button type="button" className="inline-link" onClick={() => setAuthMode('signin')}>
                      Sign In
                    </button>
                  </div>
                </article>
              ) : null}

              {authMode === 'verify' ? (
                <article className="auth-card">
                  <h3>Verification</h3>
                  <label>
                    Email
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>
                  <label>
                    Code
                    <input
                      type="text"
                      placeholder="Enter your code"
                      value={verifyCode}
                      onChange={(event) => setVerifyCode(event.target.value)}
                    />
                  </label>
                  <button type="button" onClick={handleVerifyOtp} disabled={authLoading}>
                    Verify
                  </button>
                  <div className="switch-auth-row">
                    <span>Back to login</span>
                    <button type="button" className="inline-link" onClick={() => setAuthMode('signin')}>
                      Sign In
                    </button>
                  </div>
                </article>
              ) : null}
            </div>

            {user ? (
              <div className="auth-user-strip">
                <span>Signed in as {user.email}</span>
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : null}

            {authMessage ? <p className="auth-status success">{authMessage}</p> : null}
            {authError ? <p className="auth-status error">{authError}</p> : null}
          </main>
        )}
      </div>

      <div className={`drawer-backdrop ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)} />
      <aside className={`cart-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <h4>
            <img src={cart} alt="cart" /> My shopping Cart
          </h4>
          <button type="button" onClick={() => setIsDrawerOpen(false)}>
            x
          </button>
        </div>

        <div className="drawer-items">
          {cartItems.length === 0 ? (
            <div className="drawer-placeholder">No items in cart yet.</div>
          ) : (
            cartItems.slice(0, 4).map((item) => (
              <article key={item._id} className="drawer-item">
                <img src={item.image || bookCover} alt={item.title || 'Book'} />
                <div>
                  <p>{item.title || 'Untitled'}</p>
                  <small>{toCurrency(item.price)} x {item.quantity}</small>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="drawer-actions">
          <button
            type="button"
            onClick={() => {
              setActiveView('cart-page');
              setIsDrawerOpen(false);
            }}
          >
            View Cart
          </button>
          <button type="button">Check Out</button>
        </div>
      </aside>
    </div>
  );
}

export default App;
