// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FindIn from './components/findIn';
import Login from './components/Login';
import SiteAccessManagement from './components/Features/SiteAccessManagement';
import ChangePondDrive from './components/Features/ChangePondDrive';
import AdminMenu from './components/Features/AdminMenu';
import NewUerRestPassword from './components/Features/NewUser-ResetPassword';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status from localStorage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="" element={isAuthenticated ? <FindIn /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      <Route path="/admin/dashboard" element={<AdminMenu />} />
      <Route path="/admin/change-pond-drive" element={<ChangePondDrive />} />
      <Route path="/admin/site-access-management" element={<SiteAccessManagement />} />
      <Route path="/user/reset-password" element={<NewUerRestPassword />} />
      <Route path="/user/dashboard" element={<FindIn />} />
    </Routes>
  );
}

export default App;
