import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faSignInAlt, faKey } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../styles/custom.css';
const NewUserResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(''); // Assuming you'll get the reset token from URL or props
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    let strength = 'Weak';
    const lengthCriteria = password.length >= 8;
    const numberCriteria = /\d/.test(password);
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (lengthCriteria && numberCriteria && specialCharCriteria) {
      strength = 'Strong';
    } else if (lengthCriteria && (numberCriteria || specialCharCriteria)) {
      strength = 'Medium';
    }

    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (passwordStrength === 'Weak') {
      setError('Password is too weak. Please choose a stronger password.');
      return;
    }

    try {
      const response = await axios.post(process.env.REACT_APP_API_URL + '/reset_password/', {
        password,
        confirm_password: confirmPassword,
        reset_token: resetToken,
      });
      setSuccess('Password reset successfully!');
      // Redirect or perform any additional actions here
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
    } catch (err) {
      setError('Failed to reset password. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h2>
          <FontAwesomeIcon icon={faKey} className="heading-icon" /> Reset Password
        </h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '0px' }}>
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                checkPasswordStrength(e.target.value);
              }}
            />
          </div>
          <div style={{ margin: '10px' }} className={`password-strength ${passwordStrength.toLowerCase()}`}>
            {passwordStrength}
          </div>
          <div className="input-group">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit">
            Submit <FontAwesomeIcon className="button-icon" icon={faSignInAlt} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewUserResetPassword;
