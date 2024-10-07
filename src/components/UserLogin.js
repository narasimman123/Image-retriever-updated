import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faKey, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} {...props} />;
});

const UserLogin = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const userData = localStorage.getItem('user');
    if(userData) {
      const user = JSON.parse(userData);
      if (user.role_id === 1) {
        navigate('/admin/dashboard');
      } else if (user.role_id === 2) {
        navigate('/user/dashboard');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          email: username,
        }),
      });

      const data = await response.json();
      console.log(response)
      if (response.status===200) {
        const { user } = data;

        // Check user status and role
        if (user.status === 1) {
          // setIsAuthenticated(true);
          // Store user data in localStorage
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify(user)); // Store user data
          window.location.reload();
          // if (user.role_id === 1) {
          //   navigate('/admin/dashboard');
          //   window.location.reload();
          // } else if (user.role_id === 2) {
          //   navigate('/user/dashboard');
          //   window.location.reload();
          // }
        } else {
          setError('User is not active');
          setSnackbarOpen(true);
        }
      } else {
        setError(data.message || 'Login failed');
        setSnackbarOpen(true);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleUsernameChange = (e) => {
    const inputUsername = e.target.value;
    setUsername(inputUsername);
    
    // Validate that the username ends with @mailinator.com
    if (inputUsername && !inputUsername.endsWith('@mailinator.com')) {
      setError('Username must end with @mailinator.com');
    } else {
      if (error) setError(''); // Clear error if it was previously set
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(''); // Clear error if it was previously set
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h2><FontAwesomeIcon icon={faKey} className="heading-icon" /> User Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <FontAwesomeIcon icon={faUser} className="input-icon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          <div className="input-group">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <Link to="/user/forgot-password" className="forgot-password-link">Forgot Password?</Link>
          <br></br>
          <button type="submit" disabled={!username.endsWith('@mailinator.com')}> {/* Disable button if username is invalid */}
            Login <FontAwesomeIcon className="button-icon" icon={faSignInAlt} />
          </button>
        </form>
      </div>
      
      {/* Snackbar for error messages */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserLogin;
