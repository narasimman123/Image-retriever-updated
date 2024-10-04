// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FindIn from './components/findIn';
import Login from './components/Login';
import SiteAccessManagement from './components/Features/SiteAccessManagement';
import ChangePondDrive from './components/Features/ChangePondDrive';
import AdminMenu from './components/Features/AdminMenu';
import NewUserResetPassword from './components/Features/NewUser-ResetPassword';
import UserLogin from './components/UserLogin';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    // Check authentication status and role from localStorage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const user = JSON.parse(localStorage.getItem('user'));
    
    setIsAuthenticated(authStatus);
    setRoleId(user ? user.role_id : null);
  }, []);

  return (
    <Routes>
      <Route path="/admin/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="/user/login" element={<UserLogin/>} />
      {/* Default route */}
      <Route path="" element={<Navigate to="/user/login" />} />

      {/* Redirect all unknown routes */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />

      {/* Admin routes - accessible only if role_id is 1 */}
      {isAuthenticated && roleId === 1 && (
        <>
          <Route path="/admin/dashboard" element={<AdminMenu />} />
          <Route path="/admin/change-pond-drive" element={<ChangePondDrive />} />
          <Route path="/admin/site-access-management" element={<SiteAccessManagement />} />
        </>
      )}

      {/* User routes - accessible only if role_id is 2 */}
      {isAuthenticated && roleId === 2 && (
        <>
          <Route path="/user/dashboard" element={<FindIn />} />
        </>
      )}
      <Route path="/user/reset-password/:token" element={<NewUserResetPassword />} />
    </Routes>
  );
}

export default App;
