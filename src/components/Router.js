// src/components/Router.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './navbar';

// Import your page components (create these next)
import Login from '../pages/login/login';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;