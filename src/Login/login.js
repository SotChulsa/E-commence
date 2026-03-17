import './App.css'; 

// Login page
function Login() {
  return (
    <div className="login-container">
        <h2>Login to Your Account</h2>
        <form className="login-form">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" required />
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required />
            <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <a href="/signup">Sign up here</a></p>
    </div>
  );
}

export default Login;