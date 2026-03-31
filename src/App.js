import { useCallback, useEffect, useMemo, useState } from 'react';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './pages/admin-dashboard/AdminDashboard';
import Home from './pages/home/Home';
import Cart from './pages/cart/cart';
import Profile from './pages/profile/profile';
import BookDetail from './pages/book-detail/BookDetail';
import './App.css';
import profile from './profile.svg';
import heart from './heart.svg';
import cart from './cart.svg';
import bookCover from './new-book.svg';
import {
  addToWishlist,
  addToCart,
  changeMyPassword,
  createAbaPurchase,
  createOrder,
  forgotPassword,
  getAdminStats,
  getBooks,
  getCart,
  getMyOrders,
  getMyProfile,
  getMyWishlist,
  loginUser,
  logoutUser,
  removeFromWishlist,
  refreshTokens,
  registerUser,
  resetPassword,
  removeFromCart,
  updateMyProfile,
  updateBookPrice,
  verifyOtp,
} from './api';

// LocalStorage keys for persisting auth and theme between sessions
const AUTH_STORAGE_KEY = 'digipaper_auth';
const THEME_STORAGE_KEY = 'digipaper_theme';

// Mock catalog used when backend is unavailable.
// This allows the app to still show content with placeholder data.
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

const FEATURED_TITLES = [
  'Deep Work',
  'Atomic Habits',
  'Sapiens',
  'Dune',
];

const FEATURED_FALLBACKS = {
  'deep work': {
    author: 'Cal Newport',
    description: 'Rules for focused success in a distracted world, with practical deep-focus strategies.',
    price: 19.99,
    image: '',
  },
  'atomic habits': {
    author: 'James Clear',
    description: 'Build better systems, break bad habits, and improve every day through small changes.',
    price: 18.0,
    image: '',
  },
  sapiens: {
    author: 'Yuval Noah Harari',
    description: 'A brief history of humankind, from cognitive revolution to modern civilization.',
    price: 20.0,
    image: '',
  },
  dune: {
    author: 'Frank Herbert',
    description: 'An epic science fiction saga of politics, prophecy, survival, and power on Arrakis.',
    price: 22.0,
    image: '',
  },
};

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
    avatar: payload.avatar || '',
    phone: payload.phone || '',
    address: payload.address || '',
    city: payload.city || '',
    zip: payload.zip || '',
    country: payload.country || '',
    wishlistBookIds: Array.isArray(payload.wishlistBookIds) ? payload.wishlistBookIds : [],
  },
  accessToken: payload.accessToken,
  refreshToken: payload.refreshToken,
});

const createProfileDraft = (account) => ({
  name: account?.name || '',
  email: account?.email || '',
  phone: account?.phone || '',
  address: account?.address || '',
  city: account?.city || '',
  zip: account?.zip || '',
  country: account?.country || '',
  avatar: account?.avatar || '',
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
  const [priceDrafts, setPriceDrafts] = useState({});
  const [updatingPriceBookId, setUpdatingPriceBookId] = useState('');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [selectedBook, setSelectedBook] = useState(null);
  // Wishlist state tracks selected book IDs the user has saved
  const [wishlistBookIds, setWishlistBookIds] = useState([]);

  // Admin dashboard data state, loaded only when logged in user role is admin
  const [adminStats, setAdminStats] = useState(null);
  const [adminStatsLoading, setAdminStatsLoading] = useState(false);
  const [adminStatsError, setAdminStatsError] = useState('');

  // Profile form state for editing user settings and account info
  const [profileDraft, setProfileDraft] = useState(() => createProfileDraft(initialAuth.user));
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileTab, setProfileTab] = useState('Profile Information');
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [orderHistoryError, setOrderHistoryError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState('');
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) || 'light');
  const [currentPasswordDraft, setCurrentPasswordDraft] = useState('');
  const [newPasswordDraft, setNewPasswordDraft] = useState('');
  const [confirmPasswordDraft, setConfirmPasswordDraft] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Load books once when app mounts. If backend fails, fall back to mock data.
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

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);

    if (themeMode === 'dark') {
      document.body.classList.add('theme-dark-body');
    } else {
      document.body.classList.remove('theme-dark-body');
    }

    return () => {
      document.body.classList.remove('theme-dark-body');
    };
  }, [themeMode]);

  useEffect(() => {
    setProfileDraft(createProfileDraft(user));
  }, [user]);

  const syncAuthState = ({ user: nextUser, accessToken: nextAccess, refreshToken: nextRefresh }) => {
    setUser(nextUser);
    setAccessToken(nextAccess);
    setRefreshToken(nextRefresh);
  };

  function showUiMessage(message, type = 'info') {
    setUiMessage(message);
    setUiMessageType(type);
  }

  // Wrapper that retries API calls after refreshing auth token on 401 errors.
  // Keeps user session state in sync and handles expiration gracefully.
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

  useEffect(() => {
    if (!user?._id || !accessToken) {
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      try {
        const profile = await withTokenRefresh((token) => getMyProfile(token));

        if (!isMounted || !profile) {
          return;
        }

        setUser((current) => {
          if (!current) {
            return current;
          }

          const keys = ['name', 'email', 'role', 'avatar', 'phone', 'address', 'city', 'zip', 'country'];
          const hasChange = keys.some((key) => (current[key] || '') !== (profile[key] || ''));
          return hasChange ? { ...current, ...profile } : current;
        });
      } catch (_error) {
        // Keep UI usable with locally cached profile when profile request fails.
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user?._id, accessToken, withTokenRefresh]);

  useEffect(() => {
    if (!user?._id || !accessToken) {
      setWishlistBookIds([]);
      return;
    }

    let isMounted = true;

    const loadWishlist = async () => {
      try {
        const payload = await withTokenRefresh((token) => getMyWishlist(token));
        const ids = Array.isArray(payload?.wishlistBookIds) ? payload.wishlistBookIds : [];
        if (isMounted) {
          setWishlistBookIds(ids);
        }
      } catch (_error) {
        if (isMounted) {
          setWishlistBookIds([]);
        }
      }
    };

    loadWishlist();

    return () => {
      isMounted = false;
    };
  }, [user?._id, accessToken, withTokenRefresh]);

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

  useEffect(() => {
    if (!user || user.role !== 'admin' || !accessToken) {
      setAdminStats(null);
      setAdminStatsError('');
      setAdminStatsLoading(false);
      return;
    }

    let isMounted = true;

    const loadAdminStats = async () => {
      setAdminStatsLoading(true);
      setAdminStatsError('');

      try {
        const stats = await withTokenRefresh((token) => getAdminStats(token));
        if (isMounted) {
          setAdminStats(stats || null);
        }
      } catch (error) {
        if (isMounted) {
          setAdminStats(null);
          setAdminStatsError(error.message || 'Could not load admin dashboard stats.');
        }
      } finally {
        if (isMounted) {
          setAdminStatsLoading(false);
        }
      }
    };

    loadAdminStats();

    return () => {
      isMounted = false;
    };
  }, [user, accessToken, withTokenRefresh]);

  useEffect(() => {
    if (!user?._id || !accessToken) {
      setOrderHistory([]);
      setOrderHistoryError('');
      setOrderHistoryLoading(false);
      return;
    }

    let isMounted = true;

    const loadOrders = async () => {
      setOrderHistoryLoading(true);
      setOrderHistoryError('');
      try {
        const orders = await withTokenRefresh((token) => getMyOrders(token));
        if (isMounted) {
          setOrderHistory(Array.isArray(orders) ? orders : []);
        }
      } catch (error) {
        if (isMounted) {
          setOrderHistory([]);
          setOrderHistoryError(error.message || 'Could not load order history.');
        }
      } finally {
        if (isMounted) {
          setOrderHistoryLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [user?._id, accessToken, withTokenRefresh]);

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

  useEffect(() => {
    setPriceDrafts((current) => {
      const next = { ...current };
      books.forEach((book) => {
        if (next[book._id] === undefined) {
          next[book._id] = String(book.price ?? '');
        }
      });
      return next;
    });
  }, [books]);

  const featuredBooks = useMemo(() => {
    const catalog = usingMockCatalog || books.length === 0 ? MOCK_BOOKS : books;

    return FEATURED_TITLES.map((title, index) => {
      const lowerTitle = title.toLowerCase();
      const matched = catalog.find((book) => (book.title || '').toLowerCase() === lowerTitle);
      const fallback = FEATURED_FALLBACKS[lowerTitle] || {};

      if (matched) {
        return {
          ...matched,
          image: matched.image || fallback.image || '',
          description: matched.description || fallback.description || 'Curated title for today.',
          author: matched.author || fallback.author || 'Featured author',
        };
      }

      return {
        _id: fallback?._id || `featured-fallback-${index}`,
        title,
        author: fallback.author || 'Featured author',
        description: fallback.description || 'Curated title for today.',
        price: typeof fallback.price === 'number' ? fallback.price : 19.99,
        image: fallback.image || '',
      };
    });
  }, [books, usingMockCatalog]);

  useEffect(() => {
    if (featuredBooks.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % featuredBooks.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredBooks]);

  useEffect(() => {
    if (featuredIndex < featuredBooks.length) {
      return;
    }

    setFeaturedIndex(0);
  }, [featuredBooks, featuredIndex]);

  const trendingBook = featuredBooks[featuredIndex] || filteredBooks[0] || MOCK_BOOKS[0];
  const topSellers = filteredBooks.slice(0, 4);
  const recommended =
    filteredBooks.slice(4, 8).length > 0 ? filteredBooks.slice(4, 8) : filteredBooks.slice(0, 4);
  const activeDetailBook = selectedBook || trendingBook;
  const detailRecommendations = useMemo(() => {
    const catalog = filteredBooks.length > 0 ? filteredBooks : books;
    return catalog
      .filter((book) => book._id !== activeDetailBook?._id)
      .slice(0, 3);
  }, [filteredBooks, books, activeDetailBook]);
  const categoryTabs = [
    { label: 'All', genre: 'All' },
    { label: 'Top Seller', genre: 'All' },
    { label: 'Psychology', genre: 'Nonfiction' },
    { label: 'Self-Help', genre: 'Nonfiction' },
    { label: 'Finance', genre: 'Nonfiction' },
    { label: 'History', genre: 'Nonfiction' },
    { label: 'Thriller', genre: 'Thriller' },
    { label: 'Mystery', genre: 'Mystery' },
    { label: 'Romance', genre: 'Romance' },
    { label: 'Sci-Fi', genre: 'Sci-Fi' },
    { label: 'Fantasy', genre: 'Fantasy' },
  ];

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0),
    [cartItems]
  );

  const wishlistBooks = useMemo(
    () => books.filter((book) => wishlistBookIds.includes(book._id)),
    [books, wishlistBookIds]
  );



  // Clear transient UI notifications and auth status messages.
  const clearStatus = useCallback(() => {
    setAuthError('');
    setAuthMessage('');
    setUiMessage('');
  }, []);

  useEffect(() => {
    if (!uiMessage || uiMessageType === 'loading') {
      return;
    }

    const timeout = setTimeout(() => {
      setUiMessage('');
    }, 2400);

    return () => clearTimeout(timeout);
  }, [uiMessage, uiMessageType]);

  // Show authentication panel (signin/signup/recovery) to user.
  const openAuth = useCallback((mode = 'signin') => {
    clearStatus();
    setAuthMode(mode);
    setActiveView('auth');
    setIsDrawerOpen(false);
  }, [clearStatus]);

  // Switch to profile view; requires login and resets profile tab state.
  const openProfileView = () => {
    if (!user) {
      openAuth('signin');
      return;
    }

    setProfileTab('Profile Information');
    setIsEditingProfile(false);
    setActiveView('profile');
    setIsDrawerOpen(false);
  };

  const openWishlistView = () => {
    if (!user) {
      openAuth('signin');
      return;
    }

    setActiveView('profile');
    setProfileTab('Wishlist');
    setIsDrawerOpen(false);
  };

  const handleProfileInputChange = (field, value) => {
    setProfileDraft((current) => ({ ...current, [field]: value }));
  };

  const handleProfileImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showUiMessage('Please choose an image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setProfileDraft((current) => ({ ...current, avatar: result }));
      setIsEditingProfile(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!accessToken || !user) {
      openAuth('signin');
      return;
    }

    setProfileSaving(true);
    try {
      const payload = {
        name: profileDraft.name,
        phone: profileDraft.phone,
        address: profileDraft.address,
        city: profileDraft.city,
        zip: profileDraft.zip,
        country: profileDraft.country,
        avatar: profileDraft.avatar,
      };

      const updated = await withTokenRefresh((token) => updateMyProfile(token, payload));

      setUser((current) => ({ ...(current || {}), ...updated }));
      setProfileDraft((current) => ({ ...current, ...updated }));
      setIsEditingProfile(false);
      showUiMessage('Profile updated.', 'success');
    } catch (error) {
      showUiMessage(error.message || 'Could not update profile.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!accessToken) {
      openAuth('signin');
      return;
    }

    if (!currentPasswordDraft || !newPasswordDraft || !confirmPasswordDraft) {
      showUiMessage('Please fill all password fields.', 'error');
      return;
    }

    if (newPasswordDraft !== confirmPasswordDraft) {
      showUiMessage('New password and confirm password do not match.', 'error');
      return;
    }

    setPasswordSaving(true);
    try {
      const result = await withTokenRefresh((token) =>
        changeMyPassword(token, {
          currentPassword: currentPasswordDraft,
          newPassword: newPasswordDraft,
        })
      );

      setCurrentPasswordDraft('');
      setNewPasswordDraft('');
      setConfirmPasswordDraft('');
      showUiMessage(result?.message || 'Password changed successfully.', 'success');
    } catch (error) {
      showUiMessage(error.message || 'Could not change password.', 'error');
    } finally {
      setPasswordSaving(false);
    }
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

  const handleUpdateBookPrice = async (bookId) => {
    if (user?.role !== 'admin') {
      showUiMessage('Only admin can update book price.', 'error');
      return;
    }

    if (!accessToken) {
      showUiMessage('Please sign in first.', 'info');
      openAuth('signin');
      return;
    }

    const draft = priceDrafts[bookId];
    const parsed = Number(draft);
    if (!Number.isFinite(parsed) || parsed < 0) {
      showUiMessage('Please enter a valid price.', 'error');
      return;
    }

    setUpdatingPriceBookId(bookId);
    showUiMessage('Updating price...', 'loading');

    try {
      const updatedBook = await withTokenRefresh((token) => updateBookPrice(token, bookId, parsed));

      setBooks((current) =>
        current.map((book) => (book._id === updatedBook._id ? { ...book, price: updatedBook.price } : book))
      );
      setCartItems((current) =>
        current.map((item) => (item._id === updatedBook._id ? { ...item, price: updatedBook.price } : item))
      );
      setPriceDrafts((current) => ({ ...current, [bookId]: String(updatedBook.price) }));
      showUiMessage('Price updated successfully.', 'success');
    } catch (error) {
      showUiMessage(error.message || 'Could not update price.', 'error');
    } finally {
      setUpdatingPriceBookId('');
    }
  };

  const openBookDetail = useCallback((book) => {
    if (!book) {
      return;
    }

    setSelectedBook(book);
    setActiveView('book-detail');
    setIsDrawerOpen(false);
  }, []);

  const toggleWishlist = useCallback(async (bookId) => {
    if (!bookId) {
      return;
    }

    if (!accessToken) {
      showUiMessage('Please login to use wishlist.', 'info');
      openAuth('signin');
      return;
    }

    if (String(bookId).startsWith('mock-')) {
      showUiMessage('Wishlist is available when backend books are loaded.', 'error');
      return;
    }

    const exists = wishlistBookIds.includes(bookId);
    try {
      const payload = exists
        ? await withTokenRefresh((token) => removeFromWishlist(token, bookId))
        : await withTokenRefresh((token) => addToWishlist(token, bookId));

      const ids = Array.isArray(payload?.wishlistBookIds) ? payload.wishlistBookIds : [];
      setWishlistBookIds(ids);
      showUiMessage(exists ? 'Removed from wishlist.' : 'Added to wishlist.', exists ? 'info' : 'success');
    } catch (error) {
      showUiMessage(error.message || 'Could not update wishlist.', 'error');
    }
  }, [accessToken, wishlistBookIds, withTokenRefresh, openAuth]);

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
      paymentReference: checkoutForm?.paymentReference || '',
    };

    const createdOrder = await withTokenRefresh((token) => createOrder(token, payload));
    setOrderHistory((current) => [createdOrder, ...current]);
    await withTokenRefresh((token) => refreshCartState(token, books));
    showUiMessage('Order placed successfully.', 'success');
    return createdOrder;
  };

  const handleCreateAbaPurchase = async ({ shippingInfo, amount }) => {
    if (!accessToken) {
      throw new Error('Please login first.');
    }

    const items = cartItems.map((item) => ({
      name: item.title,
      quantity: item.quantity || 1,
      price: Number(item.price || 0).toFixed(2),
    }));

    return withTokenRefresh((token) =>
      createAbaPurchase(token, {
        amount,
        shippingInfo,
        items,
      })
    );
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
    setWishlistBookIds([]);
    setOrderHistory([]);
    setExpandedOrderId('');
    setProfileDraft(createProfileDraft(null));
    setIsEditingProfile(false);
    setActiveView('home');
    showUiMessage('Logged out.', 'info');
  };





  return (
    <div className={`app-root theme-${themeMode}`}>
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
                {user?.role === 'admin' ? (
                  <button
                    type="button"
                    className="icon-btn admin-nav-btn"
                    onClick={() => setActiveView('admin-dashboard')}
                    aria-label="Admin Dashboard"
                  >
                    <span>Dashboard</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  className="icon-btn"
                  onClick={openProfileView}
                  aria-label="Profile"
                >
                  <img src={profile} alt="Profile" />
                </button>
                <button type="button" className="icon-btn" aria-label="Wishlist" onClick={openWishlistView}>
                  <img src={heart} alt="Wishlist" />
                  <span>Wishlist ({wishlistBookIds.length})</span>
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
              <Home
                trendingBook={trendingBook}
                openBookDetail={openBookDetail}
                featuredBooks={featuredBooks}
                featuredIndex={featuredIndex}
                setFeaturedIndex={setFeaturedIndex}
                wishlistBookIds={wishlistBookIds}
                toggleWishlist={toggleWishlist}
                handleAddToCart={handleAddToCart}
                addingBookId={addingBookId}
                categoryTabs={categoryTabs}
                selectedCategoryTab={selectedCategoryTab}
                setSelectedCategoryTab={setSelectedCategoryTab}
                setSelectedGenre={setSelectedGenre}
                booksLoading={booksLoading}
                booksError={booksError}
                usingMockCatalog={usingMockCatalog}
                books={books}
                topSellers={topSellers}
                recommended={recommended}
                uiMessage={uiMessage}
                uiMessageType={uiMessageType}
                user={user}
                priceDrafts={priceDrafts}
                setPriceDrafts={setPriceDrafts}
                handleUpdateBookPrice={handleUpdateBookPrice}
                updatingPriceBookId={updatingPriceBookId}
              />
            ) : null}

            {activeView === 'admin-dashboard' ? (
              <AdminDashboard
                adminStats={adminStats}
                adminStatsLoading={adminStatsLoading}
                adminStatsError={adminStatsError}
                setActiveView={setActiveView}
              />
            ) : null}

            {activeView === 'cart-page' ? (
              <Cart
                cartItems={cartItems}
                handleRemoveFromCart={handleRemoveFromCart}
                handleIncreaseQuantity={handleIncreaseQuantity}
                cartTotal={cartTotal}
                setActiveView={setActiveView}
                handleCheckout={handleCheckout}
              />
            ) : null}

            {/* user profile is displayed here*/}
            {activeView === 'profile' ? (
              <Profile
                profileDraft={profileDraft}
                user={user}
                profileTab={profileTab}
                setProfileTab={setProfileTab}
                isEditingProfile={isEditingProfile}
                setIsEditingProfile={setIsEditingProfile}
                handleProfileInputChange={handleProfileInputChange}
                handleSaveProfile={handleSaveProfile}
                profileSaving={profileSaving}
                orderHistory={orderHistory}
                orderHistoryLoading={orderHistoryLoading}
                orderHistoryError={orderHistoryError}
                expandedOrderId={expandedOrderId}
                setExpandedOrderId={setExpandedOrderId}
                wishlistBooks={wishlistBooks}
                toggleWishlist={toggleWishlist}
                openBookDetail={openBookDetail}
                handleLogout={handleLogout}
                setActiveView={setActiveView}
                themeMode={themeMode}
                setThemeMode={setThemeMode}
                currentPasswordDraft={currentPasswordDraft}
                setCurrentPasswordDraft={setCurrentPasswordDraft}
                newPasswordDraft={newPasswordDraft}
                setNewPasswordDraft={setNewPasswordDraft}
                confirmPasswordDraft={confirmPasswordDraft}
                setConfirmPasswordDraft={setConfirmPasswordDraft}
                passwordSaving={passwordSaving}
                handleChangePassword={handleChangePassword}
                handleProfileImageSelect={handleProfileImageSelect}
                createProfileDraft={createProfileDraft}
              />
            ) : null}

            {/* book detail will be displayed here */}
            {activeView === 'book-detail' ? (
              <BookDetail
                activeDetailBook={activeDetailBook}
                handleAddToCart={handleAddToCart}
                addingBookId={addingBookId}
                wishlistBookIds={wishlistBookIds}
                toggleWishlist={toggleWishlist}
                detailRecommendations={detailRecommendations}
                openBookDetail={openBookDetail}
                setActiveView={setActiveView}
              />
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
      onCreateAbaPurchase={handleCreateAbaPurchase}
    />
  </div>
  );
}

export default App;
