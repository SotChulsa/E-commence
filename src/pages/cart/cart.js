import React from 'react';
import cart from '../../cart.svg';
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

const Cart = ({
  cartItems,
  handleRemoveFromCart,
  handleIncreaseQuantity,
  cartTotal,
  setActiveView,
  handleCheckout,
}) => (
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
);

export default Cart;