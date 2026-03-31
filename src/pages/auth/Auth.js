import React from 'react';

const Auth = ({
  setActiveView,
  authMode,
  setAuthMode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handleSignIn,
  handleSignUp,
  recoveryEmail,
  setRecoveryEmail,
  handleRecoveryRequest,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  handleResetPassword,
  verifyCode,
  setVerifyCode,
  handleVerifyOtp,
  authLoading,
  user,
  handleLogout,
  authMessage,
  authError,
}) => (
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
            Full Name
            <input
              type="text"
              placeholder="Enter your full name"
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
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
              />
              Show password
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
);

export default Auth;