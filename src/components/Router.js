
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './navbar';


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