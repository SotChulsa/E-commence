const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const request = async (path, options = {}) => {
  const { headers: customHeaders = {}, ...restOptions } = options;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders,
      },
    });
  } catch (_error) {
    const error = new Error(
      `Cannot reach API at ${API_BASE}. Make sure backend is running on port 5000.`
    );
    error.status = 0;
    throw error;
  }

  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

const withAuth = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getBooks = () => request('/api/books');

export const registerUser = (payload) =>
  request('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const verifyOtp = (payload) =>
  request('/api/users/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const loginUser = (payload) =>
  request('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const refreshTokens = (refreshToken) =>
  request('/api/users/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

export const forgotPassword = (email) =>
  request('/api/users/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const resetPassword = (payload) =>
  request('/api/users/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const logoutUser = (token) =>
  request('/api/users/logout', {
    method: 'POST',
    ...withAuth(token),
  });

export const getMyProfile = (token) =>
  request('/api/users/me', {
    ...withAuth(token),
  });

export const updateMyProfile = (token, payload) =>
  request('/api/users/me', {
    method: 'PUT',
    ...withAuth(token),
    body: JSON.stringify(payload || {}),
  });

export const changeMyPassword = (token, payload) =>
  request('/api/users/change-password', {
    method: 'POST',
    ...withAuth(token),
    body: JSON.stringify(payload || {}),
  });

export const getMyWishlist = (token) =>
  request('/api/users/wishlist', {
    ...withAuth(token),
  });

export const addToWishlist = (token, bookId) =>
  request('/api/users/wishlist', {
    method: 'POST',
    ...withAuth(token),
    body: JSON.stringify({ bookId }),
  });

export const removeFromWishlist = (token, bookId) =>
  request(`/api/users/wishlist/${bookId}`, {
    method: 'DELETE',
    ...withAuth(token),
  });

export const getCart = (token) =>
  request('/api/cart', {
    ...withAuth(token),
  });

export const addToCart = (token, bookId) =>
  request('/api/cart/add', {
    method: 'POST',
    ...withAuth(token),
    body: JSON.stringify({ bookId }),
  });

export const removeFromCart = (token, bookId) =>
  request(`/api/cart/${bookId}`, {
    method: 'DELETE',
    ...withAuth(token),
  });

export const createOrder = (token, payload) =>
  request('/api/orders', {
    method: 'POST',
    ...withAuth(token),
    body: JSON.stringify(payload || {}),
  });

export const getMyOrders = (token) =>
  request('/api/orders/my', {
    ...withAuth(token),
  });

export const updateBookPrice = (token, bookId, price) =>
  request(`/api/books/${bookId}/price`, {
    method: 'PATCH',
    ...withAuth(token),
    body: JSON.stringify({ price }),
  });

export const createAbaPurchase = (token, payload) =>
  request('/api/payments/aba/purchase', {
    method: 'POST',
    ...withAuth(token),
    body: JSON.stringify(payload || {}),
  });

export const getAdminStats = (token) =>
  request('/api/admin/stats', {
    ...withAuth(token),
  });
