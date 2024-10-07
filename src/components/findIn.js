import React, { useState, useEffect } from 'react';
import { FaBars, FaSync, FaSignOutAlt } from 'react-icons/fa';
import { Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import ImageRetriever from './ImageRetriever';
import ContentRetriever from './ContentRetriever';
import TopBar from './TopBar';
import Login from './Login';
import './findIn.css';
import axios from 'axios';

const FindIn = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false); // State to track loading

  // useEffect(() => {
  //   const authStatus = localStorage.getItem('isAuthenticated') === 'true';
  //   if (authStatus) {
  //     setIsAuthenticated(true);
  //   } else {
  //     if (location.pathname !== '/login') {
  //       navigate('/login');
  //     }
  //   }
  // }, [navigate, location.pathname]);
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);
    if (authStatus) {
      setIsAuthenticated(true);
    }
    if (authStatus && user && user.role_id === 1) {
          navigate('/admin/dashboard');
      } else if (authStatus && user && user.role_id === 2) {
        navigate('/user/dashboard');
      }
    // } else {
    //   navigate('/user/login');
    // }
  }, []);
  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/user/login');
  };
  const isImageActive = location.pathname === '/';
  // const isContentActive = location.pathname === '/content-retriever';

  const handleDemandClick = async () => {
    setIsLoading(true); // Start loading
    try {
      const response = await axios.post('/api/update-vector');
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error calling the API:', error);
      setIsLoading(false); // Stop loading in case of error
    }
  };

  return (
    <>
      <div className="topbar-container">
        <TopBar onLogout={handleLogout} />
      </div>
      <div className="findin-container">
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            {!isCollapsed && <h2 className="sidebar-title">AI Retrievers</h2>}
            {/* <button className="collapse-btn" onClick={handleCollapse}>
              <FaBars />
            </button> */}
          </div>
          {!isCollapsed && (
            <div className="sidebar-menu">
              <Link to="/" className={`menu-item ${isImageActive ? 'active' : ''}`}>
                Image Retriever
              </Link>
              <Link to="" className={`menu-item ${isImageActive ? 'active' : ''}`} onClick={handleDemandClick} >
                <FaSync style={{ marginRight: '8px' }} />
                {isLoading ? 'Updating...' : 'Demand'}
                {/* Demand */}
              </Link>
              <button className="outlined-button logout-btn" onClick={handleLogout}>
                <FaSignOutAlt style={{ marginRight: '8px' }} /> Logout
              </button>
            </div>
          )}
        </aside>

        <div className="main-content">
          <Routes>
            <Route path="/" element={<ImageRetriever />} />
            <Route path="/content-retriever" element={<ContentRetriever />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default FindIn;
