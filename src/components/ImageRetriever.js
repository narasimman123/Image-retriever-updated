import React, { useState, useEffect, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { FaRobot, FaBuilding, FaBrain, FaCode, FaUser, FaLifeRing } from 'react-icons/fa';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import FullscreenIcon from '@mui/icons-material/Fullscreen'; // Import the expand icon
import IconButton from '@mui/material/IconButton';
import './ImageRetriever.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '@mui/material/Tooltip';


const icons = {
  'Automation Factory Model': <FaRobot />,
  'Dedicated Delivery Center': <FaBuilding />,
  'Gen AI Application': <FaBrain />,
  'Testing Stages': <FaCode />,
  'User Centric Testing': <FaUser />,
  'Development LifeCycle': <FaLifeRing />,
};

const ImageRetriever = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const chatHistoryRef = useRef(null); // Create the ref

  // Handle input change
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search function to call the API
  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      setError('Please enter a search term.');
        setTimeout(() => {
          setError('');
        }, 2000); 
      return;
    }
    setIsLoading(true);
    setError(null);

    // Add user message to chat history
    setChatHistory((prev) => [...prev, { type: 'user', text: query }]);

    try {
      const response = await axios.post('/api/image-retriever', { query });
      setResults(response.data);

      // Add bot response to chat history
      setChatHistory((prev) => [
        ...prev,
        {
          type: 'response',
          results: response.data,
        },
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('An error occurred while fetching the data.');

      // Add error message to chat history
      setChatHistory((prev) => [
        ...prev,
        { type: 'response', text: 'An error occurred while fetching the data.' },
      ]);
    } finally {
      setIsLoading(false);
      setSearchQuery(''); // Clear search input field after search
    }
  };

  // Handle clicking on a question card
  const handleCardClick = (term) => {
    setSearchQuery(term);
    handleSearch(term);
  };

  // Handle opening the image in a new tab
  const handleImageClick = (imgBase64) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Expanded Image</title>
            <style>
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                overflow: hidden; /* Prevent scrolling */
                background-color: #000; /* Optional: dark background */
              }
              img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain; /* Maintain aspect ratio */
              }
            </style>
          </head>
          <body>
            <img src="data:image/png;base64,${imgBase64}" alt="Expanded Image" />
          </body>
        </html>
      `);
      newWindow.document.close(); // Close the document to finish writing
    }
  };

  useEffect(() => {
    // Find the index of the last user question in the chat history
    const lastUserQuestionIndex = chatHistory
      .map((entry, index) => (entry.type === 'user' ? index : null))
      .filter((index) => index !== null)
      .pop();

    // Scroll to the last question if it exists
    if (chatHistoryRef.current && lastUserQuestionIndex !== undefined) {
      const lastQuestionElement = chatHistoryRef.current.children[lastUserQuestionIndex];
      if (lastQuestionElement) {
        lastQuestionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  }, [chatHistory]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="image-retriever-container">
      <h1 className="heading">Find IT</h1>

      <div className="chat-history" ref={chatHistoryRef}>
        {chatHistory.map((entry, index) => (
          <div key={index} className={`chat-bubble ${entry.type === 'user' ? 'user-bubble' : 'response-bubble'}`}>
            <div className="icon">
              {entry.type === 'user' ? (
                <FontAwesomeIcon icon={faUser} className="user-icon" />
              ) : (
                <span className="bot-icon">🤖</span>
              )}
            </div>
            <div className="message-content">{entry.text}</div>
            {entry.results && (
              <div className="results-section">
                {entry.results.map((result, idx) => (
                  <div key={idx} className="result-item">
                    {result.img_base64 ? (
                      <div className="image-container">
                         <Tooltip
                            title="View Image in full screen"
                            arrow
                          
                          >
                        <IconButton
                          className="expand-icon"
                          onClick={() => handleImageClick(result.img_base64)}
                          aria-label="Expand Image"
                          style={{ position: 'absolute', top: -37, right: -28, color: 'black' }} 
                        >
                          <FullscreenIcon />
                        </IconButton>
                        </Tooltip>
                        <img
                          src={`data:image/png;base64,${result.img_base64}`}
                          alt={`Retrieved content ${idx}`}
                          className="retrieved-image"
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    ) : (
                      <p>No image available</p>
                    )}
                    <div className="additional-info">
                      <p><strong>Distance:</strong> {result.distance ? result.distance.toFixed(2) : 'N/A'}</p>
                      <p>
        {result.source ? (
          <Tooltip title={result.source.replace(/\\/g, '/')} arrow >
            <a
              href={result.source.replace(/\\/g, '/')}
              target="_blank"
              rel="noopener noreferrer"
              className="source-button"
            >
              View Source
            </a>
          </Tooltip>
        ) : (
          'N/A'
        )}
      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Display the main section only when there are no results */}
      {!results.length && !isLoading && !error && (
        <div className="main-section">
          <SearchIcon fontSize="large" sx={{ color: '#3f51b5',fontSize: 50 , mt: 2, mb: 5,   transition: 'transform 0.3s ease', // Smooth transition
    '&:hover': {
      transform: 'scale(1.2)', // Scale up on hover
    }, }} />
          <div className="questions-grid">
            {Object.keys(icons).map((key) => (
              <div
                className="question-card"
                key={key}
                onClick={() => handleCardClick(key)}
              >
                <div className="icon-container">{icons[key]}</div>
                <span>{key}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {isLoading && (
        <div className="loading-indicator">
          <CircularProgress />
        </div>
      )}
      {error && <div className="error-message">{error}</div>}

      {/* Footer input section */}
      <footer className="input-section">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="How can I help you?"
          className="chat-input"
        />
        <button className="send-btn" onClick={() => handleSearch(searchQuery)}>↑</button>
      </footer>
    </div>
  );
};

export default ImageRetriever;
