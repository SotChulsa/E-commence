import { useCallback, useEffect, useMemo, useState } from 'react';
import CheckoutModal from './components/CheckoutModal';
import './App.css';
import profile from './profile.svg';
import heart from './heart.svg';
import cart from './cart.svg';
import bookCover from './new-book.svg';
import {
  addToCart,
  createOrder,
  forgotPassword,
  getBooks,
  getCart,
  loginUser,
  logoutUser,
  refreshTokens,
  registerUser,
  resetPassword,
  removeFromCart,
  verifyOtp,
} from './api';

const AUTH_STORAGE_KEY = 'digipaper_auth';

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

const normalizeAuthPayload = (payload) => ({
  user: {
    _id: payload._id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  },
  accessToken: payload.accessToken,
  refreshToken: payload.refreshToken,
});

function App() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const initialAuth = readStoredAuth();

  const [activeView, setActiveView] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [user, setUser] = useState(initialAuth.user);
  const [accessToken, setAccessToken] = useState(initialAuth.accessToken);
  const [refreshToken, setRefreshToken] = useState(initialAuth.refreshToken);

  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState('');
  const [usingMockCatalog, setUsingMockCatalog] = useState(false);

  const [cartItems, setCartItems] = useState([]);

  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');

  const [authMode, setAuthMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [uiMessage, setUiMessage] = useState('');
  const [uiMessageType, setUiMessageType] = useState('info');
  const [addingBookId, setAddingBookId] = useState('');

  useEffect(() => {
    const loadBooks = async () => {
      setBooksLoading(true);
      setBooksError('');
      try {
        const data = await getBooks();
        const list = Array.isArray(data) ? data : [];
        setBooks(list);
        setUsingMockCatalog(false);
      } catch (_error) {
        setBooks(MOCK_BOOKS);
        setUsingMockCatalog(true);
        setBooksError('Using frontend mock catalog until backend is connected.');
      } finally {
        setBooksLoading(false);
      }
    };

    loadBooks();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const mode = params.get('mode');
    const tokenFromLink = params.get('token') || '';
    const emailFromLink = params.get('email') || '';

    if (view === 'auth' && mode === 'reset' && tokenFromLink) {
      setActiveView('auth');
      setAuthMode('reset');
      setResetToken(tokenFromLink);
      if (emailFromLink) {
        setEmail(emailFromLink);
      }

      const cleanUrl = `${window.location.pathname}`;
      window.history.replaceState({}, '', cleanUrl);
    }
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

  const syncAuthState = ({ user: nextUser, accessToken: nextAccess, refreshToken: nextRefresh }) => {
    setUser(nextUser);
    setAccessToken(nextAccess);
    setRefreshToken(nextRefresh);
  };

  function showUiMessage(message, type = 'info') {
    setUiMessage(message);
    setUiMessageType(type);
  }

  const withTokenRefresh = useCallback(async (callback) => {
    try {
      return await callback(accessToken);
    } catch (error) {
      if (error.status !== 401 || !refreshToken) {
        throw error;
      }

      try {
        const refreshed = await refreshTokens(refreshToken);
        const nextAccess = refreshed.accessToken;
        const nextRefresh = refreshed.refreshToken;
        setAccessToken(nextAccess);
        setRefreshToken(nextRefresh);
        return callback(nextAccess);
      } catch (_refreshError) {
        syncAuthState({ user: null, accessToken: '', refreshToken: '' });
        setCartItems([]);
        showUiMessage('Session expired. Please sign in again.', 'error');
        setActiveView('auth');
        setAuthMode('signin');

        const expiredSessionError = new Error('Session expired. Please sign in again.');
        expiredSessionError.status = 401;
        throw expiredSessionError;
      }
    }
  }, [accessToken, refreshToken]);

  const hydrateCart = useCallback((cartData, catalog) => {
    const sourceBooks = catalog || books;
    const items = cartData?.items || [];
    const mapped = items
      .map((entry) => {
        const rawBook = entry.book;
        const bookObject =
          rawBook && typeof rawBook === 'object'
            ? rawBook
            : sourceBooks.find((book) => book._id === String(rawBook));

        if (!bookObject) {
          return null;
        }

        return {
          _id: bookObject._id,
          title: bookObject.title,
          author: bookObject.author,
          image: bookObject.image,
          price: bookObject.price,
          quantity: entry.quantity || 1,
        };
      })
      .filter(Boolean);

    setCartItems(mapped);
  }, [books]);

  const refreshCartState = useCallback(async (tokenToUse, catalog) => {
    const cartData = await getCart(tokenToUse);
    hydrateCart(cartData, catalog);
  }, [hydrateCart]);

  useEffect(() => {
    if (!user || !accessToken) {
      setCartItems([]);
      return;
    }

    const loadCart = async () => {
      try {
        await withTokenRefresh((token) => refreshCartState(token, books));
      } catch (_error) {
        setCartItems([]);
      }
    };

    loadCart();
  }, [user, accessToken, refreshToken, books, withTokenRefresh, refreshCartState]);

  const filteredBooks = useMemo(() => {
    let working = usingMockCatalog ? MOCK_BOOKS : books;

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
  }, [books, query, selectedGenre, usingMockCatalog]);

  const trendingBook = filteredBooks[0] || MOCK_BOOKS[0];
  const topSellers = filteredBooks.slice(0, 4);
  const recommended =
    filteredBooks.slice(4, 8).length > 0 ? filteredBooks.slice(4, 8) : filteredBooks.slice(0, 4);
  const categoryTabs = [
    { label: 'All', genre: 'All' },
    { label: 'Top Seller', genre: 'All' },
    { label: 'Psychology', genre: 'Nonfiction' },
    { label: 'Self-Help', genre: 'Nonfiction' },
    { label: 'Finance', genre: 'Nonfiction' },
    { label: 'History', genre: 'Nonfiction' },
  ];

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

  useEffect(() => {
    if (!uiMessage || uiMessageType === 'loading') {
      return;
    }

    const timeout = setTimeout(() => {
      setUiMessage('');
    }, 2400);

    return () => clearTimeout(timeout);
  }, [uiMessage, uiMessageType]);

  const openAuth = (mode = 'signin') => {
    clearStatus();
    setAuthMode(mode);
    setActiveView('auth');
    setIsDrawerOpen(false);
  };

  const handleAddToCart = async (bookId) => {
    if (!accessToken) {
      showUiMessage('Please login from the profile icon to use cart.', 'info');
      openAuth('signin');
      return;
    }

    if (!bookId || String(bookId).startsWith('mock-')) {
      showUiMessage('Backend catalog is empty. Add books to the database first.', 'error');
      return;
    }

    const item = (books.length > 0 ? books : MOCK_BOOKS).find((entry) => entry._id === bookId);
    if (!item) {
      showUiMessage('Book is unavailable right now.', 'error');
      return;
    }

    setAddingBookId(bookId);
    showUiMessage(`Adding ${item.title || 'book'} to cart...`, 'loading');

    try {
      await withTokenRefresh((token) => addToCart(token, bookId));
      await withTokenRefresh((token) => refreshCartState(token, books));
      showUiMessage('Added to cart.', 'success');
    } catch (error) {
      showUiMessage(error.message || 'Could not add item to cart.', 'error');
    } finally {
      setAddingBookId('');
    }
  };

  const handleRemoveFromCart = async (bookId) => {
    if (!accessToken) {
      return;
    }

    try {
      await withTokenRefresh((token) => removeFromCart(token, bookId));
      await withTokenRefresh((token) => refreshCartState(token, books));
    } catch (error) {
      showUiMessage(error.message || 'Could not remove item from cart.', 'error');
    }
  };

  const handleIncreaseQuantity = async (bookId) => {
    if (!accessToken) {
      return;
    }

    try {
      await withTokenRefresh((token) => addToCart(token, bookId));
      await withTokenRefresh((token) => refreshCartState(token, books));
    } catch (error) {
      showUiMessage(error.message || 'Could not update quantity.', 'error');
    }
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
      syncAuthState(normalizeAuthPayload(payload));
      setAuthMessage('Logged in successfully.');
      setActiveView('home');
    } catch (error) {
      const message = error.message || 'Login failed.';
      if (message.toLowerCase().includes('verify otp')) {
        setAuthMode('verify');
        setAuthError('Please verify OTP first. Check your email, then enter OTP in Verification.');
      } else {
        setAuthError(message);
      }
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
      setAuthMessage('Account created. Check your email for OTP, then verify your account.');
      setAuthMode('verify');
    } catch (error) {
      setAuthError(error.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRecoveryRequest = async () => {
    if (!recoveryEmail) {
      setAuthError('Please enter your email for recovery.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');

    try {
      await forgotPassword(recoveryEmail);
      setAuthMessage('Reset link sent. Check your email.');
      setEmail(recoveryEmail);
    } catch (error) {
      setAuthError(error.message || 'Recovery request failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken) {
      setAuthError('Invalid or expired reset link. Please request a new one.');
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      setAuthError('New password and confirm password are required.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setAuthError('New passwords do not match.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');

    try {
      await resetPassword({ token: resetToken, newPassword });
      setAuthMessage('Password reset successful. Please sign in.');
      setAuthMode('signin');
      setPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setResetToken('');
    } catch (error) {
      setAuthError(error.message || 'Reset password failed.');
    } finally {
      setAuthLoading(false);
    }
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
      const payload = await verifyOtp({ email, otp: verifyCode });
      syncAuthState(normalizeAuthPayload(payload));
      setAuthMessage('Verification successful. You are logged in.');
      setActiveView('home');
      setAuthMode('signin');
    } catch (error) {
      setAuthError(error.message || 'Verification failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Open checkout modal instead of direct checkout
  const handleCheckout = () => {
    if (!accessToken) {
      showUiMessage('Please login first.', 'info');
      openAuth('signin');
      return;
    }
    if (cartItems.length === 0) {
      showUiMessage('Your cart is empty.', 'info');
      return;
    }
    setIsCheckoutOpen(true);
    setIsDrawerOpen(false);
  };

  const handlePlaceOrder = async (checkoutForm) => {
    if (!accessToken) {
      throw new Error('Please login first.');
    }

    if (cartItems.length === 0) {
      throw new Error('Your cart is empty.');
    }

    const payload = {
      shippingInfo: {
        name: checkoutForm?.name || user?.name || '',
        email: checkoutForm?.email || user?.email || '',
        phone: checkoutForm?.phone || '',
        address: checkoutForm?.address || '',
        city: checkoutForm?.city || '',
        zip: checkoutForm?.zip || '',
        country: checkoutForm?.country || '',
      },
      paymentMethod: checkoutForm?.payment || 'card',
    };

    await withTokenRefresh((token) => createOrder(token, payload));
    await withTokenRefresh((token) => refreshCartState(token, books));
    showUiMessage('Order placed successfully.', 'success');
    setIsCheckoutOpen(false);
  };

  const handleLogout = async () => {
    try {
      if (accessToken) {
        await withTokenRefresh((token) => logoutUser(token));
      }
    } catch (_error) {
      // Clear local state regardless of API result.
    }

    syncAuthState({ user: null, accessToken: '', refreshToken: '' });
    setCartItems([]);
    showUiMessage('Logged out.', 'info');
  };

  const renderBookCard = (item) => (
    <article key={item._id} className="book-card">
      <img src={item.image || bookCover} alt={item.title || 'Book'} />
      <div className="book-meta">
        <h3>{item.title || 'Untitled'}</h3>
        <p>{item.author || 'Unknown author'}</p>
        <div className="book-row">
          <h4>{toCurrency(item.price)}</h4>
          <button
            type="button"
            onClick={() => handleAddToCart(item._id)}
            disabled={addingBookId === item._id}
          >
            {addingBookId === item._id ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
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
                  onClick={() => openAuth(user ? 'account' : 'signin')}
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
              <main className="home-view fade-in-anim">
                <section className="hero-panel">
                  <img className="hero-img-anim" src={trendingBook?.image || bookCover} alt={trendingBook?.title || 'Featured book'} />
                  <div className="hero-content slide-in-anim">
                    <span className="featured-badge">Featured Book</span>
                    <h2>{trendingBook?.title || 'Book Spotlight'}</h2>
                    <p className="hero-author">by {trendingBook?.author || 'Unknown author'}</p>
                    <p>{trendingBook?.description || 'Curated title for today.'}</p>
                    <div className="hero-actions">
                      <strong>{toCurrency(trendingBook?.price)}</strong>
                      <button
                        className="animated-btn"
                        type="button"
                        onClick={() => handleAddToCart(trendingBook?._id)}
                        disabled={addingBookId === trendingBook?._id}
                      >
                        {addingBookId === trendingBook?._id ? 'Adding...' : 'Add to Cart'}
                      </button>
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
                    {!booksLoading ? topSellers.map(renderBookCard) : null}
                  </div>
                </section>

                <section className="books-section">
                  <div className="section-title-row">
                    <h3>Recommended For You</h3>
                  </div>
                  <div className="books-grid fade-in-anim">
                    {!booksLoading ? recommended.map(renderBookCard) : null}
                  </div>
                </section>

                {uiMessage ? (
                  <div className={`floating-message ${uiMessageType}`} role="status" aria-live="polite">
                    <span className="toast-indicator" aria-hidden="true" />
                    <span>{uiMessage}</span>
                  </div>
                ) : null}
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
                        <button type="button" onClick={() => handleRemoveFromCart(item._id)}>
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => handleIncreaseQuantity(item._id)}>
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
                    <button type="button" onClick={handleCheckout}>Check Out</button>
                  </div>
                </div>
              </main>
            ) : null}

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

              {authMode === 'account' ? (
                <article className="auth-card">
                  <h3>Account</h3>
                  <p className="auth-hint">Signed in as {user?.email || 'Unknown user'}</p>
                  <button type="button" onClick={handleLogout}>
                    Logout
                  </button>
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
                  <p className="auth-hint">We will email a reset link to this address.</p>
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

              {authMode === 'reset' ? (
                <article className="auth-card">
                  <h3>Reset Password</h3>
                  <p className="auth-hint">Set your new password below.</p>
                  <label>
                    New Password
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                  </label>
                  <label>
                    Confirm New Password
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(event) => setConfirmNewPassword(event.target.value)}
                    />
                  </label>
                  <div className="toggle-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={(event) => setShowPassword(event.target.checked)}
                      />
                      Show new password
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={showConfirmPassword}
                        onChange={(event) => setShowConfirmPassword(event.target.checked)}
                      />
                      Show confirm password
                    </label>
                  </div>
                  <button type="button" onClick={handleResetPassword} disabled={authLoading}>
                    Reset Password
                  </button>
                  <div className="switch-auth-row">
                    <span>Back to login</span>
                    <button type="button" className="inline-link" onClick={() => setAuthMode('signin')}>
                      Sign In
                    </button>
                  </div>
                </article>
              ) : null}

              {authMode === 'verify' ? (
                <article className="auth-card">
                  <h3>Verification</h3>
                  <p className="auth-hint">Use the OTP sent to your email after registration.</p>
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
          <button type="button" onClick={handleCheckout}>Check Out</button>
        </div>
      </aside>
    <CheckoutModal
      isOpen={isCheckoutOpen}
      onClose={() => setIsCheckoutOpen(false)}
      cartItems={cartItems}
      cartTotal={cartTotal}
      user={user}
      onPlaceOrder={handlePlaceOrder}
    />
  </div>
  );
}

export default App;
