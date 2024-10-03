// import React, { useState } from 'react';
// import { AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemText } from '@mui/material';
// import { Box } from '@mui/system';

// const AdminMenu = () => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [drawerOpen, setDrawerOpen] = useState(true); // Sidebar open by default

//   const handleLogin = () => {
//     setIsLoggedIn(true);
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//   };

//   return (
//     <Box display="flex">
//       {/* Sidebar */}
//       <Drawer
//         variant="persistent"
//         open={drawerOpen}
//         sx={{
//           width: '15%',
//           flexShrink: 0,
//           '& .MuiDrawer-paper': {
//             width: '15%',
//             boxSizing: 'border-box',
//           },
//         }}
//       >
//         <List>
//           <ListItem button>
//             <ListItemText primary="Home" />
//           </ListItem>
//           <ListItem button>
//             <ListItemText primary="About" />
//           </ListItem>
//         </List>
//       </Drawer>

//       {/* Main Content Area */}
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           padding: '20px',
//           marginLeft: drawerOpen ? '15%' : '0', // Adjust margin based on sidebar
//           transition: 'margin 0.3s', // Smooth transition
//         }}
//       >
//         {/* AppBar that spans the full width */}
//         <AppBar position="static">
//           <Toolbar>
//             <Typography variant="h6" style={{ flexGrow: 1 }}>
//               My App
//             </Typography>
//             {isLoggedIn ? (
//               <Button color="inherit" onClick={handleLogout}>
//                 Logout
//               </Button>
//             ) : (
//               <Button color="inherit" onClick={handleLogin}>
//                 Login
//               </Button>
//             )}
//           </Toolbar>
//         </AppBar>

//         <Typography variant="h4" style={{ marginTop: '20px' }}>
//           Welcome to My App
//         </Typography>
//         {isLoggedIn ? (
//           <Typography variant="body1">You are logged in!</Typography>
//         ) : (
//           <Typography variant="body1">Please log in to access more features.</Typography>
//         )}
//       </Box>
//     </Box>
//   );
// };

// export default AdminMenu;
import React, { useState, useEffect } from 'react';
import { FaBars, FaSync, FaSignOutAlt } from 'react-icons/fa';
import { Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import ImageRetriever from '../ImageRetriever'; 
import ContentRetriever from '../ContentRetriever'; 
import TopBar from '../TopBar';
import Login from '../Login';
import '../findIn.css';
import axios from 'axios';
import ChangePondDrive from './ChangePondDrive';
import SiteAccessManagement from './SiteAccessManagement';

const AdminMenu = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false); // State to track loading
  const [sidemenuHide, setSidemenuHide] = useState(0);
  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  const handleSideMenu = (data) => {
    setSidemenuHide(data);
  }
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
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
            <button className="collapse-btn" onClick={handleCollapse}>
              <FaBars />
            </button>
          </div>
          {!isCollapsed && (
            <div className="sidebar-menu">
              <Link className={`menu-item ${isImageActive ? 'active' : ''}`} onClick={()=>handleSideMenu(0)}>
              Changepond drive
              </Link>
              <Link className={`menu-item ${isImageActive ? 'active' : ''}`}  onClick={()=>handleSideMenu(1)}>
              Access for site
              </Link>
              <button className="outlined-button logout-btn" onClick={handleLogout}>
                <FaSignOutAlt style={{ marginRight: '8px' }} /> Logout
              </button>
            </div>
          )}
        </aside>

        <div className="main-content">
            <>
            {sidemenuHide===0 && <ChangePondDrive />}
            {sidemenuHide===1 && <SiteAccessManagement />}
            </>
          {/* <Routes>
            <Route path="/" element={<ChangePondDrive />} />
            <Route path="/admin/site-access-management" element={<SiteAccessManagement />} />
          </Routes> */}
        </div>
      </div>
    </>
  );
};
export default AdminMenu;