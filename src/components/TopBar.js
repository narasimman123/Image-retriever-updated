// src/components/TopBar.js
import React from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import './topBar.css';

const TopBar = ({ onLogout }) => { // Accept onLogout prop
  return (
    <div className="topbar-container">
      <div className="topbar-logo">
        {/* You can add a logo here if needed */}
      </div>
      <div className="topbar-actions">
        <button className="logout-btn" onClick={onLogout}> {/* Call onLogout on click */}
          <LogoutIcon fontSize="medium" className="logout-icon" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
