import React, { useEffect, useState } from 'react';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, cartItems, cartTotal, user, onPlaceOrder, onCreateAbaPurchase }) => {
  const [step, setStep] = useState('details');
  const [countdown, setCountdown] = useState(600);
  const [orderId, setOrderId] = useState('');
  const [abaPayment, setAbaPayment] = useState(null);
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
    payment: 'aba',
  });

  const shippingFee = 0;
  const taxFee = 0;
  const grandTotal = Number(cartTotal || 0) + shippingFee + taxFee;
  const qrPayload = encodeURIComponent(
    abaPayment?.qrValue ||
      `merchant=Digipaper;amount=${grandTotal.toFixed(2)};currency=USD;purpose=Book Purchase`
  );
  const fallbackQrImage = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${qrPayload}`;
  const qrImage = abaPayment?.qrImage || fallbackQrImage;

  const formatTime = (seconds) => {
    const safe = Math.max(0, seconds);
    const minutes = Math.floor(safe / 60);
    const sec = safe % 60;
    return `${String(minutes).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const resetModal = () => {
    setStep('details');
    setCountdown(600);
    setOrderId('');
    setAbaPayment(null);
    setSubmitError('');
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetModal();
      return;
    }

    setForm((current) => ({
      ...current,
      name: current.name || user?.name || '',
      email: current.email || user?.email || '',
    }));
  }, [isOpen, user]);

  useEffect(() => {
    if (step !== 'scan') {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((current) => {
        if (current <= 0) {
          clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.address) {
      setSubmitError('Full name, email, and street address are required.');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const payment = await onCreateAbaPurchase({
        amount: grandTotal,
        shippingInfo: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          zip: form.zip,
          country: form.country,
        },
      });

      setAbaPayment(payment || null);
      setCountdown(600);
      setStep('scan');
    } catch (error) {
      setSubmitError(error.message || 'Could not initialize ABA payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompletePayment = async () => {
    if (countdown <= 0) {
      setSubmitError('QR session expired. Please go back and generate a new payment QR.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const order = await onPlaceOrder({
        ...form,
        paymentReference: abaPayment?.transactionId || '',
      });
      const generatedOrderId = order?._id ? `ORD-${String(order._id).slice(-8).toUpperCase()}` : `ORD-${Date.now().toString().slice(-8)}`;
      setOrderId(generatedOrderId);
      setStep('success');
    } catch (error) {
      setSubmitError(error.message || 'Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const firstItem = cartItems && cartItems.length > 0 ? cartItems[0] : null;

  return (
    <div className="checkout-modal-overlay" onClick={handleClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>&times;</button>

        {step === 'details' ? (
          <>
            <h2>Checkout</h2>
            <div className="checkout-layout details-step">
              <form className="checkout-form" onSubmit={handleProceedToPayment}>
                <div className="section shipping-info">
                  <h3>Shipping Information</h3>
                  <label>
                    Full Name *
                    <input name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                  </label>
                  <div className="row">
                    <label>
                      Email Address *
                      <input name="email" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
                    </label>
                    <label>
                      Phone Number
                      <input name="phone" placeholder="+855 12 345 678" value={form.phone} onChange={handleChange} />
                    </label>
                  </div>
                  <label>
                    Street Address *
                    <input name="address" placeholder="123 Main Street" value={form.address} onChange={handleChange} required />
                  </label>
                  <div className="row">
                    <label>
                      City
                      <input name="city" placeholder="Phnom Penh" value={form.city} onChange={handleChange} />
                    </label>
                    <label>
                      ZIP Code
                      <input name="zip" placeholder="12000" value={form.zip} onChange={handleChange} />
                    </label>
                  </div>
                  <label>
                    Country
                    <input name="country" placeholder="Cambodia" value={form.country} onChange={handleChange} />
                  </label>
                </div>

                <div className="section payment-method aba-method">
                  <h3>Payment Method</h3>
                  <div className="aba-option-card">
                    <div className="aba-icon">QR</div>
                    <div>
                      <strong>ABA Pay QR Code</strong>
                      <p>Scan and pay with ABA mobile app</p>
                    </div>
                  </div>
                  <small>
                    After clicking "Proceed to Payment", you will see a QR code to scan with your ABA mobile banking app.
                  </small>
                </div>

                {submitError ? <p className="checkout-error">{submitError}</p> : null}
              </form>

              <aside className="order-summary panel">
                <h3>Order Summary</h3>
                <div className="summary-product">
                  <div className="thumb" />
                  <div>
                    <strong>{firstItem?.title || 'No item selected'}</strong>
                    <p>{firstItem?.author || ''}</p>
                    <span>
                      {(firstItem?.quantity || 0) > 0
                        ? `${firstItem.quantity} x $${Number(firstItem.price || 0).toFixed(2)}`
                        : ''}
                    </span>
                  </div>
                </div>
                <hr />
                <div className="summary-line"><span>Subtotal</span><span>${Number(cartTotal || 0).toFixed(2)}</span></div>
                <div className="summary-line"><span>Shipping</span><span>${shippingFee.toFixed(2)}</span></div>
                <div className="summary-line"><span>Tax</span><span>${taxFee.toFixed(2)}</span></div>
                <div className="summary-line total"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
                <button className="place-order-btn" type="submit" onClick={handleProceedToPayment} disabled={isSubmitting}>
                  {isSubmitting ? 'Preparing ABA QR...' : 'Proceed to Payment'}
                </button>
                <small>By placing this order, you agree to our Terms and Privacy Policy.</small>
              </aside>
            </div>
          </>
        ) : null}

        {step === 'scan' ? (
          <>
            <button className="back-link" type="button" onClick={() => setStep('details')}>
              &larr; Back to Order Details
            </button>
            <div className="checkout-layout scan-step">
              <section className="panel qr-panel">
                <div className="aba-badge">QR</div>
                <h3>Scan to Pay with ABA</h3>
                <p>Use your ABA mobile app to scan this QR code</p>
                <div className="qr-box">
                  <img src={qrImage} alt="ABA QR payment code" />
                </div>
                {abaPayment?.transactionId ? (
                  <p className="tran-id">Transaction ID: {abaPayment.transactionId}</p>
                ) : null}
                {abaPayment?.checkoutQrUrl ? (
                  <a className="checkout-link" href={abaPayment.checkoutQrUrl} target="_blank" rel="noreferrer">
                    Open ABA checkout link
                  </a>
                ) : null}
                {abaPayment?.abaDeeplink ? (
                  <a className="checkout-link" href={abaPayment.abaDeeplink}>
                    Open ABA app
                  </a>
                ) : null}
                <div className="timer">{formatTime(countdown)}</div>
                <div className="how-to-pay">
                  <strong>How to pay:</strong>
                  <ul>
                    <li>Open your ABA mobile app</li>
                    <li>Tap the Scan QR option</li>
                    <li>Scan the QR code above</li>
                    <li>Confirm payment amount</li>
                    <li>Click I Have Completed Payment below</li>
                  </ul>
                </div>
                {submitError ? <p className="checkout-error">{submitError}</p> : null}
                <button className="confirm-pay-btn" type="button" onClick={handleCompletePayment} disabled={isSubmitting || countdown <= 0}>
                  {isSubmitting ? 'Confirming...' : 'I Have Completed Payment'}
                </button>
                <button className="cancel-pay-btn" type="button" onClick={() => setStep('details')}>
                  Cancel Payment
                </button>
              </section>

              <aside className="scan-summary-col">
                <section className="panel order-summary">
                  <h3>Order Summary</h3>
                  <div className="summary-product">
                    <div className="thumb" />
                    <div>
                      <strong>{firstItem?.title || 'No item selected'}</strong>
                      <p>{firstItem?.author || ''}</p>
                      <span>
                        {(firstItem?.quantity || 0) > 0
                          ? `${firstItem.quantity} x $${Number(firstItem.price || 0).toFixed(2)}`
                          : ''}
                      </span>
                    </div>
                  </div>
                  <hr />
                  <div className="summary-line"><span>Subtotal</span><span>${Number(cartTotal || 0).toFixed(2)}</span></div>
                  <div className="summary-line"><span>Shipping</span><span>${shippingFee.toFixed(2)}</span></div>
                  <div className="summary-line"><span>Tax</span><span>${taxFee.toFixed(2)}</span></div>
                  <div className="summary-line total"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
                </section>

                <section className="panel shipping-card">
                  <h4>Shipping Details</h4>
                  <p><strong>Name:</strong> {form.name || '-'}</p>
                  <p><strong>Email:</strong> {form.email || '-'}</p>
                  <p><strong>Phone:</strong> {form.phone || '-'}</p>
                  <p><strong>Address:</strong> {form.address || '-'}</p>
                  <p><strong>Country:</strong> {form.country || '-'}</p>
                </section>
              </aside>
            </div>
          </>
        ) : null}

        {step === 'success' ? (
          <section className="success-screen">
            <div className="success-check">✓</div>
            <h2>Payment Successful!</h2>
            <p>Thank you for your purchase.</p>
            <p className="order-id">Order ID: {orderId || 'ORD-00000000'}</p>
            <p className="confirm-email">Order confirmation has been sent to {form.email || user?.email || 'your email'}.</p>
            <button type="button" className="continue-shopping-btn" onClick={handleClose}>
              Continue Shopping
            </button>
            <div className="success-toast">Payment confirmed!</div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default CheckoutModal;
