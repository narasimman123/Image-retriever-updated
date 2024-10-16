import React, { useState, useEffect } from 'react';
import { FaBars, FaSync, FaSignOutAlt } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ImageRetriever from '../ImageRetriever';
import ContentRetriever from '../ContentRetriever';
import TopBar from '../TopBar';
import Login from '../Login';
import '../findIn.css';
import axios from 'axios';
import ChangePondDrive from './ChangePondDrive';
import SiteAccessManagement from './SiteAccessManagement';
import RefreshIcon from '@mui/icons-material/Refresh';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import { Snackbar, Alert } from '@mui/material';

const AdminMenu = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidemenuHide, setSidemenuHide] = useState(0);
  const [activeMenu, setActiveMenu] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'error'
  const [updateDemanName,SetUpdateDemanName] = useState('On Demand');
  const navigate = useNavigate();
  const location = useLocation();

  // const handleCollapse = () => {
  //   setIsCollapsed(!isCollapsed);
  // };

  const handleSideMenu = (data) => {
    setSidemenuHide(data);
    setActiveMenu(data);
    if (data === 0) {
      window.location.reload();
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDemandClick = async () => {
    SetUpdateDemanName('Updating...');
    try {
      const response = await axios.post('/api/update-vector');
      if (response.status === 200) {
        setSnackbarMessage('Update successful!');
        SetUpdateDemanName('Updated...');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error calling the API:', error);
      setSnackbarMessage('Error updating data.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <> 
      <div className="topbar-container">
        <TopBar onLogout={handleLogout} />
      </div>
      <div className="findin-container">
        <aside className={`sidebar bg_blue ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            {!isCollapsed && <h2 className="sidebar-title">AI Retrievers</h2>}
          </div>
          {!isCollapsed && (
            <div className="sidebar-menu">
              <Link className={`font_size_13 menu-item ${activeMenu === 0 ? 'active' : ''}`} onClick={() => handleSideMenu(0)}>
                <DriveFolderUploadIcon /> Changepond Drive
              </Link>
              <Link className={`font_size_13 menu-item ${activeMenu === 1 ? 'active' : ''}`} onClick={() => handleSideMenu(1)}>
                <SettingsIcon /> Access for Site
              </Link>
              <Link className={`font_size_13 menu-item ${activeMenu === 'On_demand' ? 'active' : ''}`} onClick={handleDemandClick}>
                <RefreshIcon /> {updateDemanName}
              </Link>
            </div>
          )}
        </aside>

        <div className="main-content">
          {sidemenuHide === 0 && <ChangePondDrive />}
          {sidemenuHide === 1 && <SiteAccessManagement />}
        </div>
      </div>

      {/* Snackbar for displaying messages */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminMenu;
