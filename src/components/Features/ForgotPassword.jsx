import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../styles/custom.css';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/users/forgot-password', { email });
      setIsModalOpen(true); // Open the modal on success
    } catch (err) {
      setError('Failed to send password reset link. Please try again.');
      console.error(err);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    navigate('/user/login'); // Redirect to login after closing modal
  };

  return (
    <div className="login-page">
      <div className="login-form-container" style={{ padding: '40px' }}>
        <h2>
          <FontAwesomeIcon icon={faEnvelope} className="heading-icon" /> Forgot Password
        </h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit">
            Submit <FontAwesomeIcon className="button-icon" icon={faPaperPlane} />
          </button>
        </form>
      </div>

      {/* Modal for success message using Material-UI Dialog */}
      <Dialog open={isModalOpen} onClose={handleModalClose}>
        <DialogTitle style={{ color: '#068406',fontSize: '24px',fontWeight: 'bold' }}>Success</DialogTitle>
        <DialogContent>
          <p style={{ fontSize: '19px' }}>Password reset link sent successfully! Please check your email.</p>
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

export default ForgotPassword;
