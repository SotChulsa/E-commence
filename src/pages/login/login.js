"use client";

import { useState } from "react";
import "./login.css";
import { ButtonComponent } from "../../components/buttons/buttons";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    if (message) setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setMessage("Please enter email and password");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
      }

      if (response.ok) {
        setMessage("Login successful! Redirecting");
        setMessageType("success");

        setTimeout(() => {
          window.location.href = "/Dashboard";
        }, 1000);
      } else {
        setMessage(data.error || "Login failed");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <header className="logo">
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"></link>
        <link href="https://fonts.googleapis.com/css2?family=Irish+Grover&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"></link>
        <h1>Sign In</h1>
      </header>

      {message && (
        <div>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          value={formData.email}
          onChange={handleInputChange}
          disabled={loading}
          required
        />

        <label htmlFor="password">Password</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          value={formData.password}
          onChange={handleInputChange}
          disabled={loading}
          required
        />

        <div className="login-options">
          <label>
            <input 
              type="checkbox" 
              name="remember"
              checked={formData.remember}
              onChange={handleInputChange}
              disabled={loading}
            /> Remember me
          </label>
          <a href="/#">Forgot your password?</a>
        </div>

        <ButtonComponent 
          label={loading ? "Logging in" : "Continue"} 
          type="submit"
          disabled={loading}
        />
      </form>

      <div className="divider">Or continue with</div>

      <div className="social-login">
        <img src="https://img.icons8.com/?size=100&id=17935&format=png&color=000000" alt="Google" />
        <img src="https://img.icons8.com/?size=100&id=890&format=png&color=000000" alt="Apple" />
        <img src="https://img.icons8.com/?size=100&id=118489&format=png&color=000000" alt="Facebook" />
        <img src="https://img.icons8.com/?size=100&id=phOKFKYpe00C&format=png&color=000000" alt="Twitter" />
      </div>

      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default LoginPage;