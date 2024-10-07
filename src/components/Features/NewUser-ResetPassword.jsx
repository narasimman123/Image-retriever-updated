import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faSignInAlt, faKey } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../styles/custom.css';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const NewUserResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken] = useState(token);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
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
      await axios.post(process.env.REACT_APP_API_URL + '/reset_password', {
        password,
        confirm_password: confirmPassword,
        token: resetToken,
      });
      setIsModalOpen(true); // Open the modal on success
    } catch (err) {
      setError('Failed to reset password. Please try again.');
      console.error(err);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    navigate('/user/login'); // Redirect to login after closing modal
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h2>
          <FontAwesomeIcon icon={faKey} className="heading-icon" /> Reset Password
        </h2>
        {error && <div className="error-message">{error}</div>}
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

      {/* Modal for success message using Material-UI Dialog */}
      <Dialog open={isModalOpen} onClose={handleModalClose}>
        <DialogTitle style={{ color: '#068406',fontSize: '24px',fontWeight: 'bold' }}>Success</DialogTitle>
        <DialogContent >
          <p style={{ fontSize: '19px' }}>Password reset successfully!</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} style={{ backgroundColor: '#2196f3', color: 'white' }}>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NewUserResetPassword;
