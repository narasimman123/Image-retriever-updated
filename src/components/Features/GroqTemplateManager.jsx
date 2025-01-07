import React, { useState, useEffect } from 'react';
import { Box, TextField, Slider, Button, Paper, Typography } from '@mui/material';
import axios from 'axios';

const GroqTemplateManager = () => {
  const [template, setTemplate] = useState('');
  const [temperature, setTemperature] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch initial template and temperature from backend
    fetchTemplateSettings();
  }, []);

  const fetchTemplateSettings = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_API_URL+'/api/groq-settings');
      setTemplate(response.data.template);
      setTemperature(response.data.temperature);
    } catch (error) {
      console.error('Error fetching GROQ settings:', error);
      setMessage('Error loading settings');
    }
  };

  const handleTemperatureChange = (event, newValue) => {
    setTemperature(newValue);
  };

  const handleTemplateChange = (event) => {
    setTemplate(event.target.value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(process.env.REACT_APP_API_URL+'/api/groq-settings', {
        template,
        temperature
      });
      
      if (response.status === 200) {
        setMessage('Settings updated successfully!');
      }
    } catch (error) {
      console.error('Error updating GROQ settings:', error);
      setMessage('Error updating settings');
    }
    setIsLoading(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        GROQ Template Settings
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>
          Template Text
        </Typography>
        <TextField
          multiline
          rows={6}
          fullWidth
          value={template}
          onChange={handleTemplateChange}
          placeholder="Enter your GROQ template here..."
          variant="outlined"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>
          Temperature: {temperature}
        </Typography>
        <Slider
          value={temperature}
          onChange={handleTemperatureChange}
          min={0}
          max={1}
          step={0.1}
          marks
          valueLabelDisplay="auto"
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

export default GroqTemplateManager;