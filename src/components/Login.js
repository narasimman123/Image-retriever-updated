import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faKey, faSignInAlt, faSearch, faBook, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} {...props} />;
});

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAuthenticated') === 'true';
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role_id === 1) {
        navigate('/admin/dashboard');
      } else if (user.role_id === 2) {
        navigate('/user/dashboard');
      }
    }
  }, []);

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

      if (response.ok) {
        const { user } = data;

        if (user.status === 1) {
          setIsAuthenticated(true);
          sessionStorage.setItem('isAuthenticated', 'true');
          sessionStorage.setItem('user', JSON.stringify(user));

          if (user.role_id === 1) {
            navigate('/admin/dashboard');
            window.location.reload();
          } else if (user.role_id === 2) {
            navigate('/user/dashboard');
            window.location.reload();
          }
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
    setUsername(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="login-container">
      <div className="left-column" style={{ backgroundImage: 'linear-gradient(135deg, #000000, #0056b3)' }}>
        <h2>FindIT</h2>
        <h3>Your Ultimate Resource Finder</h3>
        <div className="icons">
          <FontAwesomeIcon icon={faSearch} className="icon" />
          <FontAwesomeIcon icon={faBook} className="icon" />
          <FontAwesomeIcon icon={faMapMarkerAlt} className="icon" />
        </div>
      </div>

      <div className="right-column">
        <div className="login-form-container">
          <h2 style={{ marginTop:'0' }}><FontAwesomeIcon icon={faKey} className="heading-icon" /> Admin Login</h2>
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
            <button type="submit">
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
    </div>
  );
};

export default Login;
