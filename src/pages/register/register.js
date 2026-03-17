import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import "./register.css";
import { ButtonComponent } from "../../components/buttons/buttons";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    repassword: "",
    role: "user"
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (message) setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      setMessage("Please fill in all required fields");
      setMessageType("error");
      return;
    }
    
    if (formData.password !== formData.repassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }
    
    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters");
      setMessageType("error");
      return;
    }
    
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Registration successful");
        setMessageType("success");
        
        setFormData({
          name: "",
          email: "",
          password: "",
          repassword: "",
          role: "user"
        });
        
      } else {
        setMessage(`${data.error || "Registration failed"}`);
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
    <div className="register-container">
        <h1>Sign Up</h1>
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          value={formData.name}
          onChange={handleInputChange}
          disabled={loading}
          required
        />

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
          minLength={6}
        />

        <label htmlFor="repassword">Re-Password</label>
        <input 
          type="password" 
          id="repassword" 
          name="repassword" 
          value={formData.repassword}
          onChange={handleInputChange}
          disabled={loading}
          required
        />

        <ButtonComponent 
          label={loading ? "Registering..." : "Register"} 
          type="submit"
          disabled={loading}
        />
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;