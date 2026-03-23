import React, { useEffect, useState } from 'react';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, cartItems, cartTotal, user, onPlaceOrder }) => {
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    country: '',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    payment: 'card',
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSubmitError('');
    setForm((current) => ({
      ...current,
      name: current.name || user?.name || '',
      email: current.email || user?.email || '',
    }));
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await onPlaceOrder(form);
    } catch (error) {
      setSubmitError(error.message || 'Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Checkout</h2>
        <div className="checkout-layout">
          <form id="checkout-form" className="checkout-form" onSubmit={handleSubmit}>
            <div className="section shipping-info">
              <h3>Shipping Information</h3>
              <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
              <div className="row">
                <input name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
                <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
              </div>
              <input name="address" placeholder="Street Address" value={form.address} onChange={handleChange} required />
              <div className="row">
                <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
                <input name="zip" placeholder="ZIP Code" value={form.zip} onChange={handleChange} />
              </div>
              <input name="country" placeholder="Country" value={form.country} onChange={handleChange} />
            </div>
            <div className="section payment-method">
              <h3>Payment Method</h3>
              <div className="payment-options">
                <label><input type="radio" name="payment" value="card" checked={form.payment==='card'} onChange={handleChange} /> Credit / Debit Card</label>
                <label><input type="radio" name="payment" value="paypal" checked={form.payment==='paypal'} onChange={handleChange} /> PayPal</label>
                <label><input type="radio" name="payment" value="bank" checked={form.payment==='bank'} onChange={handleChange} /> Bank Transfer</label>
              </div>
              {form.payment === 'card' && (
                <>
                  <input name="cardNumber" placeholder="Card Number" value={form.cardNumber} onChange={handleChange} required />
                  <input name="cardName" placeholder="Cardholder Name" value={form.cardName} onChange={handleChange} required />
                  <div className="row">
                    <input name="expiry" placeholder="MM/YY" value={form.expiry} onChange={handleChange} required />
                    <input name="cvv" placeholder="CVV" value={form.cvv} onChange={handleChange} required />
                  </div>
                </>
              )}
            </div>
            {submitError ? <p className="checkout-error">{submitError}</p> : null}
          </form>

          <aside className="order-summary">
            <h3>Order Summary</h3>
            {cartItems && cartItems.length > 0 ? cartItems.map(item => (
              <div className="summary-item" key={item._id}>
                <span>{item.title}</span>
                <span>{item.quantity} × ${item.price}</span>
              </div>
            )) : <div className="summary-item">No items in cart.</div>}
            <div className="summary-item total"><span>Total</span><span>${cartTotal}</span></div>
            <button className="place-order-btn" type="submit" form="checkout-form" disabled={isSubmitting}>
              {isSubmitting ? 'Placing order...' : 'Place Order'}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
