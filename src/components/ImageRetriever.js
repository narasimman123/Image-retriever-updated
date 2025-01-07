import React, { useState, useEffect, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { FaRobot, FaBuilding, FaBrain, FaCode, FaUser, FaLifeRing } from 'react-icons/fa';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import IconButton from '@mui/material/IconButton';
import './ImageRetriever.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '@mui/material/Tooltip';
import DownloadIcon from '@mui/icons-material/Download';
import { Checkbox } from '@mui/material';

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
  const chatHistoryRef = useRef(null);
  const [useLLM, setUseLLM] = useState(false);

  const toggleLLM = () => setUseLLM(!useLLM);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

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
    setChatHistory((prev) => [...prev, { type: 'user', text: query }]);

    try {
      // Send the useLLM toggle state to the API
      const response = await axios.post(process.env.REACT_APP_API_URL+'/api/image_query', { query, useLLM });

      // Check if response contains results or LLM response
      setResults(response.data);
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
      setChatHistory((prev) => [
        ...prev,
        { type: 'response', text: 'An error occurred while fetching the data.' },
      ]);
    } finally {
      setIsLoading(false);
      setSearchQuery('');
    }
  };

  const handleCardClick = (term) => {
    setSearchQuery(term);
    handleSearch(term);
  };

  const handleImageClick = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  useEffect(() => {
    const lastUserQuestionIndex = chatHistory
      .map((entry, index) => (entry.type === 'user' ? index : null))
      .filter((index) => index !== null)
      .pop();

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

  // Download function
  const handleDownload = async (fileName) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/download-blob?blob_name=${fileName}`, {
        responseType: 'blob', // Important to specify the response type as blob
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // Specify the file name for download
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up the link element
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  return (
    <div className="image-retriever-container">
      <h1 className="heading">FindIT</h1>

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
                    {result.image_url ? (
                      <div className="image-container">
                        <Tooltip title="View Image in full screen" arrow>
                          <IconButton
                            className="expand-icon"
                            onClick={() => handleImageClick(result.image_url)}
                            aria-label="Expand Image"
                            style={{ position: 'absolute', top: -37, right: -28, color: 'black' }}
                          >
                            <FullscreenIcon />
                          </IconButton>
                        </Tooltip>
                        <img
                          src={result.image_url}
                          alt={`Retrieved content ${idx}`}
                          className="retrieved-image"
                          style={{ cursor: 'pointer' }}
                        />
                        <br></br>
                         <div>
                          {result.score && (
                            <p><b>Score</b>: {result.score}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p>No image available</p>
                    )}
                    <div className="additional-info">
                   <p>
                     {result.source ? (
                       <Tooltip title={result.source.replace(/\\/g, '/')} arrow>
                         <button onClick={() => handleDownload(result.source)} className="source-button">
                           <DownloadIcon style={{ marginRight: '8px' }} />
                           Download
                         </button>
                       </Tooltip>
                     ) : (
                       'N/A'
                     )}
                   </p>
                   {idx < entry.results.length - 1 && <hr />}
                 </div>
               </div>
             ))}
           </div>           
            )}
          </div>
        ))}
      </div>

      {!results.length && !isLoading && !error && (
        <div className="main-section">
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

      <footer className="input-section">
        <div className="toggle-container">
          <label className="toggle-label">
            <span className={`toggle-text ${useLLM ? 'active' : ''}`}>LLM</span>
            <input
              type="checkbox"
              checked={useLLM}
              onChange={toggleLLM}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="How can I help you?"
          className="chat-input"
        />
        <button className="send-btn" onClick={() => handleSearch(searchQuery)}>
          ↑
        </button>
      </footer>
    </div>
  );
};

export default ImageRetriever;
