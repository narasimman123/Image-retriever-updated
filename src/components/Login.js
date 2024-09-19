import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faKey, faUnlock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if already authenticated
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    if (authStatus) {
      navigate('/'); // Redirect to home page if authenticated
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple authentication check
    if (username === 'admin' && password === '1234') {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true'); // Save authentication state
      navigate('/'); // Redirect to the home page after successful login
    } else {
      setError('Invalid username or password');
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (error) setError(''); // Clear error message on input change
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(''); // Clear error message on input change
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h2><FontAwesomeIcon icon={faKey} className="heading-icon" /> Login</h2>
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
    </div>
  );
};

export default Login;
