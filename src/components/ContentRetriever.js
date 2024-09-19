import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import './ContentRetriever.css';

const ContentRetriever = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  // Handle input change
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search action
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term.');
      setResults(null);
      return;
    }

    setChatHistory((prevHistory) => [...prevHistory, { type: 'user', text: searchQuery }]);

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/content-retriever', { query: searchQuery });

      setResults(response.data || '');

      setChatHistory((prevHistory) => [
        ...prevHistory,
        { type: 'response', text: response.data.answer, details: response.data.token_details },
      ]);

      setSearchQuery('');
    } catch (err) {
      console.error('Error details:', err);
      setError('An error occurred while fetching the data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press in input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="content-retriever-container">
      <h1 className="heading">Find IT</h1>
      <div className="icon-container">
        <SearchIcon fontSize="large" sx={{ color: '#3f51b5', mt: 2, mb: 5 }} />
      </div>

      {error && <div className="error-message">{error}</div>}
      {isLoading && (
        <div className="loading-indicator">
          <CircularProgress />
        </div>
      )}

      <div className="chat-section">
        {/* Display chat history */}
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`chat-bubble ${message.type === 'user' ? 'user-bubble' : 'response-bubble'}`}
          >
            <div className="icon">
              {message.type === 'user' ? (
                <span className="user-icon">😊</span>
              ) : (
                <span className="bot-icon">🤖</span>
              )}
            </div>
            <div className="message-content">{message.text}</div>

            {/* Display additional details for response messages */}
            {message.type === 'response' && message.details && (
              <div className="details-section">
                <p>Total input tokens: {message.details.total_input_tokens}</p>
                <p>Total output tokens: {message.details.total_output_tokens}</p>
                <p>Total tokens: {message.details.total_tokens}</p>
                <p>Cost in USD: ${message.details.cost}</p>
              </div>
            )}
          </div>
        ))}
      </div>

    <footer className="input-section">
        <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything?"
            className="chat-input"
        />
        <button className="send-btn" onClick={handleSearch}>
            ↑
        </button>
    </footer>

    </div>
  );
};

export default ContentRetriever;
