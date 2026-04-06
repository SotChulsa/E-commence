import { useCallback, useEffect, useMemo, useState } from 'react';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './pages/admin-dashboard/AdminDashboard';
import AddBook from './pages/add-book/AddBook';
import Cart from './pages/cart/cart';
import BookDetail from './pages/book-detail/BookDetail';
import Home from './pages/home/Home';
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
  getMySubscription,
  getMyWishlist,
  loginUser,
  logoutUser,
  removeFromWishlist,
  refreshTokens,
  registerUser,
  resetPassword,
  removeFromCart,
  selectSubscriptionPlan,
  updateMyProfile,
  updateBookPrice,
  verifyOtp,
} from './api';

const AUTH_STORAGE_KEY = 'digipaper_auth';
const THEME_STORAGE_KEY = 'digipaper_theme';

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

const PLAN_CARDS = [
  {
    key: 'free',
    title: 'Free',
    price: 0,
    cadence: '/forever',
    subtitle: 'Basic shopping experience',
    features: ['Standard delivery', 'Regular shipping speed', 'Access to all books'],
    badge: 'Current Plan',
  },
  {
    key: 'pro',
    title: 'Pro',
    price: 2.99,
    cadence: '/month',
    subtitle: 'Get more with your subscription',
    features: ['Free delivery on all orders', 'Much faster delivery (2-3 days)', 'Access to all books'],
    badge: 'Most Popular',
  },
  {
    key: 'premium',
    title: 'Premium',
    price: 9.99,
    cadence: '/month',
    subtitle: 'Ultimate book lover experience',
    features: [
      'Free delivery on all orders',
      'Much faster delivery (2-3 days)',
      'Priority processing',
      'Access to all books',
      'Choose 1 FREE book monthly',
    ],
    badge: '',
  },
];

const PLAN_PAYMENT_TTL_SECONDS = 300;

const BOOK_FEATURE_TAGS = {
  trending: 'trending',
  topSeller: 'topSeller',
  bestSeller: 'bestSeller',
  recommended: 'recommended',
  newArrival: 'newArrival',
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

const normalizeSubscriptionPayload = (payload) => {
  const rawPlan = payload?.subscriptionPlan || payload?.subscription?.plan || 'free';
  const plan = ['free', 'pro', 'premium'].includes(String(rawPlan).toLowerCase())
    ? String(rawPlan).toLowerCase()
    : 'free';

  return {
    plan,
    status: payload?.subscriptionStatus || payload?.subscription?.status || 'active',
    startedAt: payload?.subscriptionStartedAt || payload?.subscription?.startedAt || null,
    renewsAt: payload?.subscriptionRenewsAt || payload?.subscription?.renewsAt || null,
  };
};

const normalizeAuthPayload = (payload) => {
  const subscription = normalizeSubscriptionPayload(payload);

  return {
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
    subscription,
    subscriptionPlan: subscription.plan,
    subscriptionStatus: subscription.status,
    subscriptionStartedAt: subscription.startedAt,
    subscriptionRenewsAt: subscription.renewsAt,
  },
  accessToken: payload.accessToken,
  refreshToken: payload.refreshToken,
  };
};

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
  const [viewParams, setViewParams] = useState({});

  const handleSetActiveView = (view, params) => {
    setActiveView(view);
    setViewParams(params || {});
  };
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
  const [wishlistBookIds, setWishlistBookIds] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [adminStatsLoading, setAdminStatsLoading] = useState(false);
  const [adminStatsError, setAdminStatsError] = useState('');
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
  const [subscriptionSaving, setSubscriptionSaving] = useState(false);
  const [planPayment, setPlanPayment] = useState({
    isOpen: false,
    planKey: '',
    planTitle: '',
    amount: 0,
    transactionId: '',
    qrImage: '',
    checkoutQrUrl: '',
    abaDeeplink: '',
    qrValue: '',
    expiresAt: null,
  });
  const [paymentNow, setPaymentNow] = useState(Date.now());

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

  const refreshCatalog = useCallback(async () => {
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
  }, []);

  const handleBookDeleted = useCallback(
    async (bookId) => {
      if (usingMockCatalog) {
        setBooks((current) => current.filter((book) => book._id !== bookId));
        return;
      }

      await refreshCatalog();
    },
    [refreshCatalog, usingMockCatalog]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const mode = params.get('mode');
    const tokenFromLink = params.get('token') || '';
    const emailFromLink = params.get('email') || '';

    if (view === 'auth' && mode === 'reset' && tokenFromLink) {
      handleSetActiveView('auth');
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
        handleSetActiveView('auth');
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
          const hasChange = keys.some((key) => (current[key] || '') !== (profile[key] || ''))
            || (current.subscriptionPlan || '') !== (profile.subscriptionPlan || '')
            || (current.subscriptionStatus || '') !== (profile.subscriptionStatus || '')
            || (current.subscriptionRenewsAt || '') !== (profile.subscriptionRenewsAt || '');
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
      return;
    }

    let isMounted = true;

    const loadSubscription = async () => {
      try {
        const subscription = await withTokenRefresh((token) => getMySubscription(token));
        if (!isMounted || !subscription) {
          return;
        }

        setUser((current) => {
          if (!current) {
            return current;
          }

          const normalized = normalizeSubscriptionPayload({
            subscription,
            subscriptionPlan: subscription.plan,
            subscriptionStatus: subscription.status,
            subscriptionStartedAt: subscription.startedAt,
            subscriptionRenewsAt: subscription.renewsAt,
          });

          return {
            ...current,
            subscription: normalized,
            subscriptionPlan: normalized.plan,
            subscriptionStatus: normalized.status,
            subscriptionStartedAt: normalized.startedAt,
            subscriptionRenewsAt: normalized.renewsAt,
          };
        });
      } catch (_error) {
        // Keep current profile data if subscription endpoint is unavailable.
      }
    };

    loadSubscription();

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
    const usedIds = new Set();

    const curated = FEATURED_TITLES.map((title, index) => {
      const lowerTitle = title.toLowerCase();
      const matched = catalog.find((book) => (book.title || '').toLowerCase() === lowerTitle);
      const fallback = FEATURED_FALLBACKS[lowerTitle] || {};

      if (matched) {
        const id = matched?._id || `${title}-${index}`;
        usedIds.add(String(id));
        return {
          ...matched,
          image: matched.image || fallback.image || '',
          description: matched.description || fallback.description || 'Curated title for today.',
          author: matched.author || fallback.author || 'Featured author',
        };
      }

      if (usingMockCatalog || books.length === 0) {
        return {
          _id: fallback?._id || `featured-fallback-${index}`,
          title,
          author: fallback.author || 'Featured author',
          description: fallback.description || 'Curated title for today.',
          price: typeof fallback.price === 'number' ? fallback.price : 19.99,
          image: fallback.image || '',
        };
      }

      return null;
    }).filter(Boolean);

    // If curated titles are missing in live backend data, fill with other catalog books
    // so the header carousel always rotates through multiple items.
    const fillers = catalog
      .filter((book) => {
        const id = String(book?._id || '');
        if (!id || usedIds.has(id)) {
          return false;
        }
        usedIds.add(id);
        return true;
      })
      .slice(0, Math.max(0, 6 - curated.length));

    const result = [...curated, ...fillers];
    return result.length > 0 ? result : MOCK_BOOKS.slice(0, 4);
  }, [books, usingMockCatalog]);

  useEffect(() => {
    if (featuredBooks.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % featuredBooks.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [featuredBooks]);

  useEffect(() => {
    if (featuredIndex < featuredBooks.length) {
      return;
    }

    setFeaturedIndex(0);
  }, [featuredBooks, featuredIndex]);

  const trendingBooks = useMemo(() => {
    const candidates = [...featuredBooks, ...filteredBooks.slice(8, 20)];
    const seen = new Set();

    return candidates.filter((book) => {
      const id = book?._id || (book?.title || '').toLowerCase();
      if (!id || seen.has(id)) {
        return false;
      }

      seen.add(id);
      return true;
    });
  }, [featuredBooks, filteredBooks]);

  const booksByFeatureTag = useMemo(() => {
    const getPrimaryTag = (book) => {
      const tags = Array.isArray(book?.featureTags) ? book.featureTags : [];
      const valid = tags.find((tag) => Object.values(BOOK_FEATURE_TAGS).includes(tag));
      return valid || '';
    };

    const build = (tag) => filteredBooks.filter((book) => getPrimaryTag(book) === tag);

    return {
      trending: build(BOOK_FEATURE_TAGS.trending),
      topSeller: build(BOOK_FEATURE_TAGS.topSeller),
      bestSeller: build(BOOK_FEATURE_TAGS.bestSeller),
      recommended: build(BOOK_FEATURE_TAGS.recommended),
      newArrival: build(BOOK_FEATURE_TAGS.newArrival),
    };
  }, [filteredBooks]);

  const trendingList = booksByFeatureTag.trending.length > 0
    ? booksByFeatureTag.trending
    : trendingBooks;

  const topSellers = booksByFeatureTag.topSeller.length > 0
    ? booksByFeatureTag.topSeller
    : filteredBooks.slice(0, 8);

  const bestSellers = booksByFeatureTag.bestSeller.length > 0
    ? booksByFeatureTag.bestSeller
    : filteredBooks.slice(4, 12);

  const recommended = booksByFeatureTag.recommended.length > 0
    ? booksByFeatureTag.recommended
    : (filteredBooks.slice(4, 12).length > 0 ? filteredBooks.slice(4, 12) : filteredBooks.slice(0, 8));

  const newArrivals = booksByFeatureTag.newArrival.length > 0
    ? booksByFeatureTag.newArrival
    : filteredBooks.slice(0, 12);

  const trendingBook = featuredBooks[featuredIndex] || trendingList[0] || filteredBooks[0] || MOCK_BOOKS[0];
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
    { label: 'Fiction', genre: 'Fiction' },
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

  const currentSubscriptionPlan = useMemo(
    () => normalizeSubscriptionPayload(user || {}).plan,
    [user]
  );

  const activePlanPayment = useMemo(
    () => PLAN_CARDS.find((plan) => plan.key === planPayment.planKey) || null,
    [planPayment.planKey]
  );

  const planPaymentSecondsLeft = useMemo(() => {
    if (!planPayment?.isOpen || !planPayment?.expiresAt) {
      return 0;
    }

    return Math.max(0, Math.ceil((planPayment.expiresAt - paymentNow) / 1000));
  }, [planPayment, paymentNow]);

  const isPlanPaymentExpired = planPayment?.isOpen && planPaymentSecondsLeft <= 0;

  const planPaymentTimeLabel = useMemo(() => {
    const total = Math.max(0, planPaymentSecondsLeft);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [planPaymentSecondsLeft]);

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

  useEffect(() => {
    if (!planPayment?.isOpen) {
      return;
    }

    const timer = setInterval(() => {
      setPaymentNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [planPayment?.isOpen]);

  const openAuth = useCallback((mode = 'signin') => {
    clearStatus();
    setAuthMode(mode);
    setActiveView('auth');
    setIsDrawerOpen(false);
  }, [clearStatus]);

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

  const openPlansView = () => {
    setActiveView('plans');
    setIsDrawerOpen(false);
  };

  const closePlanPayment = () => {
    setPlanPayment({
      isOpen: false,
      planKey: '',
      planTitle: '',
      amount: 0,
      transactionId: '',
      qrImage: '',
      checkoutQrUrl: '',
      abaDeeplink: '',
      qrValue: '',
      expiresAt: null,
    });
  };

  const handleSelectPlan = async (planKey) => {
    if (!accessToken || !user) {
      showUiMessage('Please sign in first to select a plan.', 'info');
      openAuth('signin');
      return;
    }

    if (planKey === currentSubscriptionPlan) {
      showUiMessage('You are already on this plan.', 'info');
      return;
    }

    const targetPlan = PLAN_CARDS.find((plan) => plan.key === planKey);
    if (!targetPlan) {
      showUiMessage('Invalid plan selected.', 'error');
      return;
    }

    setSubscriptionSaving(true);
    showUiMessage(targetPlan.price > 0 ? 'Loading ABA payment...' : 'Updating subscription...', 'loading');

    try {
      if (targetPlan.price > 0) {
        const shippingInfo = {
          name: user?.name || 'Customer',
          email: user?.email || '',
          phone: user?.phone || '',
          address: user?.address || 'N/A',
          city: user?.city || '',
          zip: user?.zip || '',
          country: user?.country || '',
        };

        const purchase = await withTokenRefresh((token) =>
          createAbaPurchase(token, {
            amount: targetPlan.price,
            shippingInfo,
            items: [
              {
                name: `${targetPlan.title} Subscription`,
                quantity: 1,
                price: targetPlan.price,
              },
            ],
          })
        );

        if (!purchase?.transactionId) {
          throw new Error('Could not initialize ABA payment. Please try again.');
        }

        setPlanPayment({
          isOpen: true,
          planKey: targetPlan.key,
          planTitle: targetPlan.title,
          amount: Number(targetPlan.price || 0),
          transactionId: purchase?.transactionId || '',
          qrImage: purchase?.qrImage || '',
          checkoutQrUrl: purchase?.checkoutQrUrl || '',
          abaDeeplink: purchase?.abaDeeplink || '',
          qrValue: purchase?.qrValue || '',
          expiresAt: Date.now() + PLAN_PAYMENT_TTL_SECONDS * 1000,
        });

        showUiMessage('Complete ABA payment, then confirm to activate your plan.', 'info');
        return;
      }

      const response = await withTokenRefresh((token) =>
        selectSubscriptionPlan(token, {
          plan: planKey,
          paymentMethod: 'free',
        })
      );
      const normalized = normalizeSubscriptionPayload({
        subscription: response?.subscription,
        subscriptionPlan: response?.subscription?.plan,
        subscriptionStatus: response?.subscription?.status,
        subscriptionStartedAt: response?.subscription?.startedAt,
        subscriptionRenewsAt: response?.subscription?.renewsAt,
      });

      setUser((current) => ({
        ...(current || {}),
        subscription: normalized,
        subscriptionPlan: normalized.plan,
        subscriptionStatus: normalized.status,
        subscriptionStartedAt: normalized.startedAt,
        subscriptionRenewsAt: normalized.renewsAt,
      }));

      showUiMessage(response?.message || 'Subscription updated.', 'success');
    } catch (error) {
      showUiMessage(error.message || 'Could not update subscription.', 'error');
    } finally {
      setSubscriptionSaving(false);
    }
  };

  const handleConfirmPlanPayment = async () => {
    if (!planPayment?.planKey || !planPayment?.transactionId) {
      showUiMessage('Missing payment reference. Please retry payment.', 'error');
      return;
    }

    if (isPlanPaymentExpired) {
      showUiMessage('Payment session expired. Please subscribe again to generate a new QR.', 'error');
      return;
    }

    setSubscriptionSaving(true);
    showUiMessage('Confirming payment and activating plan...', 'loading');

    try {
      const response = await withTokenRefresh((token) =>
        selectSubscriptionPlan(token, {
          plan: planPayment.planKey,
          paymentMethod: 'aba',
          paymentReference: planPayment.transactionId,
        })
      );

      const normalized = normalizeSubscriptionPayload({
        subscription: response?.subscription,
        subscriptionPlan: response?.subscription?.plan,
        subscriptionStatus: response?.subscription?.status,
        subscriptionStartedAt: response?.subscription?.startedAt,
        subscriptionRenewsAt: response?.subscription?.renewsAt,
      });

      setUser((current) => ({
        ...(current || {}),
        subscription: normalized,
        subscriptionPlan: normalized.plan,
        subscriptionStatus: normalized.status,
        subscriptionStartedAt: normalized.startedAt,
        subscriptionRenewsAt: normalized.renewsAt,
      }));

      closePlanPayment();
      showUiMessage(response?.message || 'Subscription activated successfully.', 'success');
    } catch (error) {
      showUiMessage(error.message || 'Could not confirm payment.', 'error');
    } finally {
      setSubscriptionSaving(false);
    }
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
      const nextBook = updatedBook && typeof updatedBook === 'object'
        ? updatedBook
        : { _id: bookId, price: parsed };
      const nextId = nextBook._id || bookId;
      const nextPrice = Number.isFinite(Number(nextBook.price)) ? Number(nextBook.price) : parsed;

      setBooks((current) =>
        current.map((book) => (book._id === nextId ? { ...book, price: nextPrice } : book))
      );
      setCartItems((current) =>
        current.map((item) => (item._id === nextId ? { ...item, price: nextPrice } : item))
      );
      setPriceDrafts((current) => ({ ...current, [bookId]: String(nextPrice) }));
      showUiMessage('Price updated successfully.', 'success');
    } catch (error) {
      if (error.status === 401) {
        showUiMessage('Unauthorized. Please sign in as admin and try again.', 'error');
      } else if (error.status === 404) {
        showUiMessage('Update endpoint not found on backend. Please verify backend book update route.', 'error');
      } else {
        showUiMessage(error.message || 'Could not update price.', 'error');
      }
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
  }, [accessToken, openAuth, wishlistBookIds, withTokenRefresh]);

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
    closePlanPayment();
    setActiveView('home');
    showUiMessage('Logged out.', 'info');
  };

  const renderBookCard = (item) => (
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

  const getOrderStatusLabel = (status) => {
    const value = String(status || '').toLowerCase();
    if (value === 'delivered') return 'Delivered';
    if (value === 'shipped') return 'Shipped';
    if (value === 'cancelled') return 'Cancelled';
    if (value === 'pending' || value === 'paid') return 'Processing';
    return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : 'Processing';
  };

  const getOrderStatusClass = (status) => {
    const value = String(status || '').toLowerCase();
    if (value === 'delivered') return 'delivered';
    if (value === 'shipped') return 'shipped';
    if (value === 'cancelled') return 'cancelled';
    return 'processing';
  };

  const getOrderCode = (orderId = '', index = 0) => {
    const suffix = String(orderId).slice(-6).toUpperCase() || String(index + 1).padStart(3, '0');
    return `ORD-${suffix}`;
  };

  const getOrderDateLabel = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return 'Date unavailable';
    }

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getOrderItemCount = (order) => {
    const items = Array.isArray(order?.items) ? order.items : [];
    return items.reduce((sum, item) => sum + Number(item?.quantity || 1), 0);
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
              <button type="button" className="logo-btn" onClick={() => handleSetActiveView('home')}>
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
                  className={`icon-btn plan-nav-btn ${activeView === 'plans' ? 'active' : ''}`}
                  onClick={openPlansView}
                  aria-label="Plans"
                >
                  <span>Plans</span>
                </button>
                {user?.role === 'admin' ? (
                  <button
                    type="button"
                    className="icon-btn admin-nav-btn"
                    onClick={() => handleSetActiveView('admin-dashboard')}
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
                trendingBooks={trendingList}
                bestSellers={bestSellers}
                newArrivals={newArrivals}
                uiMessage={uiMessage}
                uiMessageType={uiMessageType}
                user={user}
                priceDrafts={priceDrafts}
                setPriceDrafts={setPriceDrafts}
                handleUpdateBookPrice={handleUpdateBookPrice}
                updatingPriceBookId={updatingPriceBookId}
              />
            ) : null}

            {activeView === 'plans' ? (
              <main className="plans-view fade-in-anim">
                <section className="plans-header-block">
                  <h1>Choose Your Plan</h1>
                  <p>
                    Upgrade your reading experience with our subscription plans. Get free delivery,
                    faster shipping, and exclusive perks.
                  </p>
                </section>

                <section className="plans-grid" aria-label="Subscription plans">
                  {PLAN_CARDS.map((plan) => {
                    const isCurrent = currentSubscriptionPlan === plan.key;
                    const isPopular = plan.key === 'pro';
                    const shouldShowCurrentBadge = isCurrent;

                    return (
                      <article
                        key={plan.key}
                        className={`plan-card ${isPopular ? 'popular' : ''} ${isCurrent ? 'current' : ''}`}
                      >
                        {shouldShowCurrentBadge ? (
                          <span className="plan-badge current">Current Plan</span>
                        ) : null}
                        {!shouldShowCurrentBadge && plan.badge ? (
                          <span className="plan-badge popular">{plan.badge}</span>
                        ) : null}

                        <header className="plan-card-header">
                          <h2>{plan.title}</h2>
                          <p className="plan-price">
                            <strong>{toCurrency(plan.price)}</strong>
                            <span>{plan.cadence}</span>
                          </p>
                          <p className="plan-subtitle">{plan.subtitle}</p>
                        </header>

                        <ul className="plan-feature-list">
                          {plan.features.map((feature) => (
                            <li key={`${plan.key}-${feature}`}>{feature}</li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          className={`plan-action-btn ${isCurrent ? 'current' : ''}`}
                          onClick={() => handleSelectPlan(plan.key)}
                          disabled={subscriptionSaving || isCurrent}
                        >
                          {isCurrent
                            ? 'Current Plan'
                            : subscriptionSaving
                              ? 'Updating...'
                              : 'Subscribe Now'}
                        </button>
                      </article>
                    );
                  })}
                </section>
              </main>
            ) : null}

            {activeView === 'admin-dashboard' ? (
              <AdminDashboard
                adminStats={adminStats}
                adminStatsLoading={adminStatsLoading}
                adminStatsError={adminStatsError}
                setActiveView={handleSetActiveView}
                accessToken={accessToken}
                withTokenRefresh={withTokenRefresh}
                showUiMessage={showUiMessage}
                usingMockCatalog={usingMockCatalog}
                onBookDeleted={handleBookDeleted}
              />
            ) : null}

            {activeView === 'add-book' || activeView === 'edit-book' ? (
              <AddBook
                setActiveView={handleSetActiveView}
                accessToken={accessToken}
                withTokenRefresh={withTokenRefresh}
                showUiMessage={showUiMessage}
                editBook={viewParams.book}
              />
            ) : null}

            {activeView === 'cart-page' ? (
              <Cart
                cartItems={cartItems}
                handleRemoveFromCart={handleRemoveFromCart}
                handleIncreaseQuantity={handleIncreaseQuantity}
                cartTotal={cartTotal}
                setActiveView={handleSetActiveView}
                handleCheckout={handleCheckout}
              />
            ) : null}

            {activeView === 'profile' ? (
              <main className="profile-view profile-layout">
                <aside className="profile-sidebar-card">
                  <div className="profile-avatar-wrap">
                    {profileDraft.avatar ? (
                      <img src={profileDraft.avatar} alt={profileDraft.name || 'Profile'} className="profile-avatar" />
                    ) : (
                      <div className="profile-avatar profile-avatar-fallback" aria-hidden="true">
                        {(profileDraft.name || user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <label className="profile-photo-btn" htmlFor="profile-photo-input">+</label>
                    <input
                      id="profile-photo-input"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageSelect}
                    />
                  </div>

                  <h3>{profileDraft.name || user?.name || 'User'}</h3>
                  <p>{profileDraft.email || user?.email || ''}</p>
                  <p className="profile-plan-chip">
                    Plan: {currentSubscriptionPlan.charAt(0).toUpperCase()}
                    {currentSubscriptionPlan.slice(1)}
                  </p>

                  <nav className="profile-menu" aria-label="Profile menu">
                    <button
                      type="button"
                      className={profileTab === 'Profile Information' ? 'active' : ''}
                      onClick={() => setProfileTab('Profile Information')}
                    >
                      My Profile
                    </button>
                    <button
                      type="button"
                      className={profileTab === 'Order History' ? 'active' : ''}
                      onClick={() => setProfileTab('Order History')}
                    >
                      Orders
                    </button>
                    <button
                      type="button"
                      className={profileTab === 'Wishlist' ? 'active' : ''}
                      onClick={() => setProfileTab('Wishlist')}
                    >
                      Wishlist
                    </button>
                    <button
                      type="button"
                      className={profileTab === 'Settings' ? 'active' : ''}
                      onClick={() => setProfileTab('Settings')}
                    >
                      Settings
                    </button>
                    <button type="button" className="danger" onClick={handleLogout}>Logout</button>
                  </nav>
                </aside>

                <section className="profile-main-card">
                  <div className="profile-tabs">
                    {['Profile Information', 'Order History', 'Wishlist'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className={profileTab === tab ? 'active' : ''}
                        onClick={() => setProfileTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {profileTab === 'Profile Information' ? (
                    <div className="profile-info-card">
                      <div className="profile-info-head">
                        <h2>Personal Information</h2>
                        {!isEditingProfile ? (
                          <button type="button" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
                        ) : (
                          <div className="profile-info-actions">
                            <button type="button" onClick={() => { setIsEditingProfile(false); setProfileDraft(createProfileDraft(user)); }}>
                              Cancel
                            </button>
                            <button type="button" onClick={handleSaveProfile} disabled={profileSaving}>
                              {profileSaving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="profile-form-grid">
                        <label>
                          <span>Full Name</span>
                          <input
                            type="text"
                            value={profileDraft.name}
                            onChange={(event) => handleProfileInputChange('name', event.target.value)}
                            disabled={!isEditingProfile || profileSaving}
                          />
                        </label>
                        <label>
                          <span>Email Address</span>
                          <input type="email" value={profileDraft.email} disabled />
                        </label>
                        <label>
                          <span>Phone Number</span>
                          <input
                            type="text"
                            value={profileDraft.phone}
                            onChange={(event) => handleProfileInputChange('phone', event.target.value)}
                            disabled={!isEditingProfile || profileSaving}
                          />
                        </label>
                        <label>
                          <span>Street Address</span>
                          <input
                            type="text"
                            value={profileDraft.address}
                            onChange={(event) => handleProfileInputChange('address', event.target.value)}
                            disabled={!isEditingProfile || profileSaving}
                          />
                        </label>
                        <label>
                          <span>City</span>
                          <input
                            type="text"
                            value={profileDraft.city}
                            onChange={(event) => handleProfileInputChange('city', event.target.value)}
                            disabled={!isEditingProfile || profileSaving}
                          />
                        </label>
                        <label>
                          <span>ZIP Code</span>
                          <input
                            type="text"
                            value={profileDraft.zip}
                            onChange={(event) => handleProfileInputChange('zip', event.target.value)}
                            disabled={!isEditingProfile || profileSaving}
                          />
                        </label>
                        <label className="full-width">
                          <span>Country</span>
                          <input
                            type="text"
                            value={profileDraft.country}
                            onChange={(event) => handleProfileInputChange('country', event.target.value)}
                            disabled={!isEditingProfile || profileSaving}
                          />
                        </label>
                      </div>
                    </div>
                  ) : null}

                  {profileTab === 'Order History' ? (
                    <div className="profile-info-card order-history-panel">
                      <h2>Order History</h2>

                      {orderHistoryLoading ? <p className="profile-subtitle">Loading order history...</p> : null}
                      {orderHistoryError ? <p className="profile-subtitle">{orderHistoryError}</p> : null}

                      {!orderHistoryLoading && !orderHistoryError && orderHistory.length === 0 ? (
                        <p className="profile-subtitle">No orders yet. Your completed orders will appear here.</p>
                      ) : null}

                      <div className="order-history-list">
                        {orderHistory.map((order, index) => {
                          const orderStatusClass = getOrderStatusClass(order?.status);
                          const orderStatusLabel = getOrderStatusLabel(order?.status);
                          const itemCount = getOrderItemCount(order);
                          const orderCode = getOrderCode(order?._id, index);
                          const isExpanded = expandedOrderId === order?._id;

                          return (
                            <article key={order?._id || `${orderCode}-${index}`} className="order-history-item">
                              <div className="order-history-main">
                                <div className="order-history-meta">
                                  <div className="order-id-row">
                                    <strong>{orderCode}</strong>
                                    <span className={`order-status ${orderStatusClass}`}>{orderStatusLabel}</span>
                                  </div>
                                  <p>{getOrderDateLabel(order?.createdAt)}</p>
                                  <p>{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                                </div>

                                <div className="order-history-right">
                                  <p className="order-total">{toCurrency(Number(order?.totalPrice || 0))}</p>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedOrderId(isExpanded ? '' : order?._id)}
                                  >
                                    {isExpanded ? 'Hide Details' : 'View Details'}
                                  </button>
                                </div>
                              </div>

                              {isExpanded ? (
                                <div className="order-history-details">
                                  <p><strong>Payment:</strong> {String(order?.paymentMethod || 'card').toUpperCase()}</p>
                                  <p><strong>Shipping:</strong> {order?.shippingInfo?.address || 'No address provided'}</p>
                                  <p><strong>Reference:</strong> {order?.paymentReference || 'N/A'}</p>
                                </div>
                              ) : null}
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {profileTab === 'Wishlist' ? (
                    <div className="profile-info-card wishlist-panel">
                      <h2>Wishlist</h2>
                      {wishlistBooks.length === 0 ? (
                        <p className="profile-subtitle">No wishlist items yet. Tap the heart on books to save them.</p>
                      ) : (
                        <div className="wishlist-grid">
                          {wishlistBooks.map((book) => (
                            <article key={book._id} className="wishlist-item">
                              <img src={book.image || bookCover} alt={book.title || 'Book'} />
                              <div className="wishlist-item-meta">
                                <h4>{book.title || 'Untitled'}</h4>
                                <p>{book.author || 'Unknown author'}</p>
                                <strong>{toCurrency(book.price)}</strong>
                              </div>
                              <div className="wishlist-item-actions">
                                <button type="button" onClick={() => openBookDetail(book)}>View</button>
                                <button type="button" onClick={() => toggleWishlist(book._id)}>Remove</button>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {profileTab === 'Settings' ? (
                    <div className="profile-info-card settings-panel">
                      <h2>Settings</h2>

                      <section className="settings-block">
                        <h4>Appearance</h4>
                        <p className="profile-subtitle">Switch between light and dark mode.</p>
                        <div className="theme-toggle-row">
                          <button
                            type="button"
                            className={themeMode === 'light' ? 'active' : ''}
                            onClick={() => setThemeMode('light')}
                          >
                            Light Mode
                          </button>
                          <button
                            type="button"
                            className={themeMode === 'dark' ? 'active' : ''}
                            onClick={() => setThemeMode('dark')}
                          >
                            Dark Mode
                          </button>
                        </div>
                      </section>

                      <section className="settings-block">
                        <h4>Security</h4>
                        <p className="profile-subtitle">Change your account password.</p>

                        <div className="settings-password-grid">
                          <label>
                            <span>Current Password</span>
                            <input
                              type="password"
                              value={currentPasswordDraft}
                              onChange={(event) => setCurrentPasswordDraft(event.target.value)}
                              disabled={passwordSaving}
                            />
                          </label>

                          <label>
                            <span>New Password</span>
                            <input
                              type="password"
                              value={newPasswordDraft}
                              onChange={(event) => setNewPasswordDraft(event.target.value)}
                              disabled={passwordSaving}
                            />
                          </label>

                          <label>
                            <span>Confirm New Password</span>
                            <input
                              type="password"
                              value={confirmPasswordDraft}
                              onChange={(event) => setConfirmPasswordDraft(event.target.value)}
                              disabled={passwordSaving}
                            />
                          </label>
                        </div>

                        <div className="settings-actions">
                          <button type="button" onClick={handleChangePassword} disabled={passwordSaving}>
                            {passwordSaving ? 'Saving...' : 'Update Password'}
                          </button>
                        </div>
                      </section>
                    </div>
                  ) : null}

                  {profileTab !== 'Profile Information' && profileTab !== 'Order History' && profileTab !== 'Wishlist' && profileTab !== 'Settings' ? (
                    <div className="profile-info-card">
                      <h2>{profileTab}</h2>
                      <p className="profile-subtitle">This section is ready for your next feature.</p>
                      <div className="profile-actions">
                        <button type="button" onClick={() => setActiveView('home')}>Back to Home</button>
                        <button type="button" onClick={() => setActiveView('cart-page')}>View Cart</button>
                      </div>
                    </div>
                  ) : null}
                </section>
              </main>
            ) : null}

            {activeView === 'book-detail' ? (
              <BookDetail
                activeDetailBook={activeDetailBook}
                handleAddToCart={handleAddToCart}
                addingBookId={addingBookId}
                wishlistBookIds={wishlistBookIds}
                toggleWishlist={toggleWishlist}
                detailRecommendations={detailRecommendations}
                openBookDetail={openBookDetail}
                setActiveView={handleSetActiveView}
              />
            ) : null}

          </>
        ) : (
          <main className="auth-view">
            <button type="button" className="back-home-link" onClick={() => handleSetActiveView('home')}>
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
    {planPayment.isOpen ? (
      <div className="plan-payment-backdrop" role="presentation">
        <section className="plan-payment-modal" role="dialog" aria-modal="true" aria-label="ABA payment">
          <button
            type="button"
            className="plan-payment-close"
            aria-label="Close payment dialog"
            onClick={closePlanPayment}
            disabled={subscriptionSaving}
          >
            x
          </button>

          <h3>Complete Your Subscription</h3>
          <p className="plan-payment-subtitle">
            Scan the QR code with your ABA mobile banking app to complete your subscription.
          </p>

          <div className="plan-payment-qr-wrap">
            {planPayment.qrImage ? (
              <img className="plan-payment-qr" src={planPayment.qrImage} alt="ABA QR Code" />
            ) : (
              <div className="plan-payment-qr-placeholder">ABA QR Code</div>
            )}
          </div>

          <div className="plan-payment-amount">
            <span>Amount to pay</span>
            <strong>{toCurrency(Number(planPayment.amount || activePlanPayment?.price || 0))}</strong>
            <small>per month</small>
          </div>

          <p className={`plan-payment-timer ${isPlanPaymentExpired ? 'expired' : ''}`}>
            {isPlanPaymentExpired
              ? 'Payment session expired. Please close and subscribe again.'
              : `Time left: ${planPaymentTimeLabel}`}
          </p>

          {planPayment.transactionId ? (
            <div className="plan-payment-ref">Ref: {planPayment.transactionId}</div>
          ) : null}

          {!planPayment.qrImage && !planPayment.checkoutQrUrl && !planPayment.abaDeeplink && planPayment.qrValue ? (
            <p className="plan-payment-code">{planPayment.qrValue}</p>
          ) : null}

          <div className="plan-payment-actions">
            <button type="button" onClick={handleConfirmPlanPayment} disabled={subscriptionSaving || isPlanPaymentExpired}>
              {subscriptionSaving ? 'Activating...' : "I've Completed Payment"}
            </button>
            <button type="button" onClick={closePlanPayment} disabled={subscriptionSaving}>Cancel</button>
          </div>
        </section>
      </div>
    ) : null}

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
