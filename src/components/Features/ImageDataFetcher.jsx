import React, { useState, useEffect } from 'react';
import { Card, CardMedia, Grid, Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Snackbar, Alert } from '@mui/material';

const ImageDataFetcher = () => {
    const [imageData, setImageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar state
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Message to display in Snackbar

    useEffect(() => {
        const fetchImageData = async () => {
            try {
                const response = await fetch('/api/get_image_data');
                if (!response.ok) {
                    throw new Error('Failed to fetch image data');
                }
                const data = await response.json();
                setImageData(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchImageData();
    }, []);

    // Group images by their source
    const groupedImages = imageData.reduce((acc, item) => {
        const source = item.source || 'Unknown Source';
        if (!acc[source]) {
            acc[source] = [];
        }
        acc[source].push(item);
        return acc;
    }, {});

    const handleImageClick = (item) => {
        setSelectedImage(item);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedImage(null);
    };

    const copyImageUrl = (url) => {
        navigator.clipboard.writeText(url)
            .then(() => {
                setSnackbarMessage('Image URL copied to clipboard!');
                setSnackbarOpen(true);
            })
            .catch((err) => {
                console.error('Failed to copy: ', err);
            });
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography variant="h6" color="error">
                    Error: {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 4, backgroundColor: '#f5f5f5' }}>
            <Box
                sx={{
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    paddingRight: '16px',
                }}
            >
                {/* Render groups by source */}
                {Object.keys(groupedImages).map((source, index) => (
                    <Box key={index} sx={{ marginBottom: 4 }}>
                        {/* Source Header with Image Count */}
                        <Card sx={{ backgroundColor: '#3f51b5', color: 'white', borderRadius: 2, padding: 2, marginBottom: 2, boxShadow: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {source} ({groupedImages[source].length} Images)
                            </Typography>
                        </Card>

                        {/* Image Grid for this Source */}
                        <Grid container spacing={4}>
                            {groupedImages[source].map((item, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card
                                        sx={{
                                            border: '1px solid #ddd',
                                            borderRadius: 2,
                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                                            },
                                        }}
                                        onClick={() => handleImageClick(item)}
                                    >
                                        {item.image_url && (
                                            <CardMedia
                                                component="img"
                                                height="auto"
                                                image={item.image_url}
                                                alt={item.description || 'Image'}
                                                loading="lazy"
                                                sx={{
                                                    width: '100%',
                                                    objectFit: 'contain', // Maintain aspect ratio
                                                    borderTopLeftRadius: '8px',
                                                    borderTopRightRadius: '8px',
                                                }}
                                            />
                                        )}
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))}
            </Box>

            {/* Image Detail Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>Image Details</DialogTitle>
                <DialogContent>
                    {selectedImage && (
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                            {/* Left side (Image and Copy URL) */}
                            <Box sx={{ flex: 1 }}>
                                <img
                                    src={selectedImage.image_url}
                                    alt={selectedImage.description || 'Image'}
                                    style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                                />
                                <Box sx={{ marginTop: 2 }}>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        fullWidth
                                        onClick={() => copyImageUrl(selectedImage.image_url)}
                                    >
                                        Copy Image URL
                                    </Button>
                                </Box>
                            </Box>

                            {/* Right side (Description) */}
                            <Box sx={{ flex: 2 }}>
                                <Typography variant="h6" gutterBottom>Description:</Typography>
                                <Typography variant="body1" paragraph>
                                    {selectedImage.description || 'No description available.'}
                                </Typography>
                                <Typography variant="h6" gutterBottom>Source:</Typography>
                                <Typography variant="body1">{selectedImage.source || 'No source available.'}</Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Snackbar for URL Copy Confirmation */}
            <Snackbar 
                open={snackbarOpen} 
                autoHideDuration={3000} 
                onClose={handleSnackbarClose} 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ backgroundColor: '#2196F3', color: 'white' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ImageDataFetcher;
