import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopBar from '../TopBar';
import '../findIn.css';
import axios from 'axios';
import ChangePondDrive from './ChangePondDrive';
import SiteAccessManagement from './SiteAccessManagement';
import ImageDataFetcher from './ImageDataFetcher';
import GroqTemplateManager from './GroqTemplateManager';
import ConfigManager from './ConfigManager';
import RefreshIcon from '@mui/icons-material/Refresh';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TuneIcon from '@mui/icons-material/Tune';
import { Snackbar, Alert } from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

const AdminMenu = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidemenuHide, setSidemenuHide] = useState(0);
  const [activeMenu, setActiveMenu] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [updateDemanName, SetUpdateDemanName] = useState('On Demand');
  const [redirectLink, setRedirectLink] = useState(false);
  const navigate = useNavigate();

  const handleSideMenu = (data) => {
    setSidemenuHide(data);
    setActiveMenu(data);
    if (data === 0) {
      setRedirectLink(true);
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
              <Link className={`font_size_13 menu-item ${activeMenu === 2 ? 'active' : ''}`} onClick={() => handleSideMenu(2)}>
                <PhotoLibraryIcon /> Image Dashboard
              </Link>
              <Link className={`font_size_13 menu-item ${activeMenu === 3 ? 'active' : ''}`} onClick={() => handleSideMenu(3)}>
                <TextFieldsIcon /> GROQ Prompt
              </Link>
              <Link className={`font_size_13 menu-item ${activeMenu === 4 ? 'active' : ''}`} onClick={() => handleSideMenu(4)}>
                <TuneIcon /> Config Settings
              </Link>
            </div>
          )}
        </aside>

        <div className="main-content">
          {sidemenuHide === 0 && <ChangePondDrive redirectLink={redirectLink} setRedirectLink={setRedirectLink} />}
          {sidemenuHide === 1 && <SiteAccessManagement />}
          {sidemenuHide === 2 && <ImageDataFetcher />}
          {sidemenuHide === 3 && <GroqTemplateManager />}
          {sidemenuHide === 4 && <ConfigManager />}
        </div>
      </div>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminMenu;