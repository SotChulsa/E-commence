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

const Profile = ({
  profileDraft,
  user,
  profileTab,
  setProfileTab,
  isEditingProfile,
  setIsEditingProfile,
  handleProfileInputChange,
  handleSaveProfile,
  profileSaving,
  orderHistory,
  orderHistoryLoading,
  orderHistoryError,
  expandedOrderId,
  setExpandedOrderId,
  wishlistBooks,
  toggleWishlist,
  openBookDetail,
  handleLogout,
  setActiveView,
  themeMode,
  setThemeMode,
  currentPasswordDraft,
  setCurrentPasswordDraft,
  newPasswordDraft,
  setNewPasswordDraft,
  confirmPasswordDraft,
  setConfirmPasswordDraft,
  passwordSaving,
  handleChangePassword,
  handleProfileImageSelect,
  createProfileDraft,
}) => (
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
                <button type="button" onClick={() => { setIsEditingProfile(false); createProfileDraft(user); }}>
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
);

export default Profile;