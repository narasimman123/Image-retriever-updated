import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, Chip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const ConfigManager = () => {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [wordCountThreshold, setWordCountThreshold] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_API_URL+'/api/config-settings');
      setKeywords(response.data.skip_keywords);
      setWordCountThreshold(response.data.word_count_threshold);
    } catch (error) {
      console.error('Error fetching config:', error);
      setMessage('Error loading configuration');
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleDeleteKeyword = (keywordToDelete) => {
    setKeywords(keywords.filter((keyword) => keyword !== keywordToDelete));
  };

  const handleWordCountChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 0) {
      setWordCountThreshold(value);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(process.env.REACT_APP_API_URL+'/api/config-settings', {
        skip_keywords: keywords,
        word_count_threshold: wordCountThreshold
      });
      
      if (response.status === 200) {
        setMessage('Configuration updated successfully!');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      setMessage('Error updating configuration');
    }
    setIsLoading(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Configuration Settings
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>
          Skip Keywords
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Enter keyword"
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleAddKeyword}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {keywords.map((keyword, index) => (
            <Chip
              key={index}
              label={keyword}
              onDelete={() => handleDeleteKeyword(keyword)}
              deleteIcon={<DeleteIcon />}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>
          Word Count Threshold
        </Typography>
        <TextField
          type="number"
          value={wordCountThreshold}
          onChange={handleWordCountChange}
          inputProps={{ min: 0 }}
          size="small"
        />
      </Box>

      <Button 
        variant="contained" 
        onClick={handleSubmit}
        disabled={isLoading}
        fullWidth
      >
        {isLoading ? 'Updating...' : 'Update Settings'}
      </Button>

      {message && (
        <Typography 
          sx={{ mt: 2, textAlign: 'center' }}
          color={message.includes('Error') ? 'error' : 'success'}
        >
          {message}
        </Typography>
      )}
    </Paper>
  );
};

export default ConfigManager;