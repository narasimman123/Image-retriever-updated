import React, { useState, useEffect } from 'react';
import { FaSync, FaSignOutAlt } from 'react-icons/fa';
import { Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import ImageRetriever from './ImageRetriever';
import ContentRetriever from './ContentRetriever';
import TopBar from './TopBar';
import Login from './Login';
import './findIn.css';
import axios from 'axios';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import CollectionsIcon from '@mui/icons-material/Collections';
const FindIn = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('User'); // State for username
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false); // State to track loading

  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAuthenticated') === 'true';
    const userData = sessionStorage.getItem('user');
    const user = JSON.parse(userData);
    if (authStatus) {
      setIsAuthenticated(true);
      if (user) {
        setUsername(user.username); // Set the username
      }
    }
    if (authStatus && user && user.role_id === 1) {
      navigate('/admin/dashboard');
    } else if (authStatus && user && user.role_id === 2) {
      navigate('/user/dashboard');
    }
  }, [navigate]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('user');
    navigate('/user/login');
  };

  const isImageActive = location.pathname === '/';

  const handleDemandClick = async () => {
    setIsLoading(true); // Start loading
    try {
      const response = await axios.post(process.env.REACT_APP_API_URL+'/api/update-vector');
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
      

      <div className="findin-container">
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            {!isCollapsed && <h2 className="sidebar-title">AI Retrievers</h2>}
          </div>
          {!isCollapsed && (
            <div className="sidebar-menu">
              <Link to="/" className={`menu-item ${isImageActive ? 'active' : ''}`}>
               <CollectionsIcon/> Image Retriever 
              </Link>
              {/* <button className="outlined-button logout-btn" onClick={handleLogout}>
                <FaSignOutAlt style={{ marginRight: '8px' }} /> Logout
              </button> */}
            </div>
          )}
        </aside>

        <div className="main-content">
        <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Welcome {username} !
          </Typography>
          <Button color="inherit" onClick={handleLogout} style={{ border:'1px solid #fff' }}>
            <FaSignOutAlt style={{ marginRight: '8px' }} /> Logout
          </Button>
        </Toolbar>
      </AppBar>
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
