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
  cartSubtotal,
  freeBookId,
  onSelectFreeBook,
  onClearFreeBook,
  freeBookDiscount,
  isPremiumFreeBookEligible,
  isPremiumActive,
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
      <>
        {cartItems.map((item) => {
          const isSelectedFreeBook = freeBookId === item._id;

          return (
            <div key={item._id} className="cart-line">
              <div className="cart-product-col">
                <img src={item.image || bookCover} alt={item.title || 'Book'} />
                <div>
                  <strong>{item.title || 'Untitled'}</strong>
                  <p>{item.author || 'Unknown author'}</p>
                  {isSelectedFreeBook ? <p className="free-book-pill">Selected as free book</p> : null}
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
                {isPremiumActive ? (
                  <button
                    className={`free-book-btn ${isSelectedFreeBook ? 'selected' : ''}`}
                    type="button"
                    onClick={() => (isSelectedFreeBook ? onClearFreeBook() : onSelectFreeBook(item._id))}
                    disabled={!isPremiumFreeBookEligible && !isSelectedFreeBook}
                  >
                    {isSelectedFreeBook ? 'Free Book Selected' : 'Set as Free Book'}
                  </button>
                ) : null}
                <button className="remove-btn" type="button" onClick={() => handleRemoveFromCart(item._id)}>
                  Remove
                </button>
              </div>
            </div>
          );
        })}

        {isPremiumActive ? (
          <div className="premium-offer-note">
            {isPremiumFreeBookEligible
              ? 'Premium benefit unlocked: choose 1 free book for this order.'
              : 'Premium benefit: add books to reach $50 subtotal to unlock 1 free book.'}
          </div>
        ) : null}
      </>
    )}

    <div className="cart-page-footer">
      <p className="cart-total">Subtotal: {toCurrency(cartSubtotal)}</p>
      {freeBookDiscount > 0 ? <p className="cart-total">Free Book Discount: -{toCurrency(freeBookDiscount)}</p> : null}
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