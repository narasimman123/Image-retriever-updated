import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardMedia, 
    Grid, 
    Box, 
    CircularProgress, 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    Button, 
    Typography, 
    Snackbar, 
    Alert,
    IconButton 
} from '@mui/material';
import { 
    Folder as FolderIcon, 
    KeyboardArrowDown, 
    KeyboardArrowRight, 
    ContentCopy as ContentCopyIcon,
    Close as CloseIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

const ImageDataFetcher = () => {
    const [imageData, setImageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(null); // Track current image index
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [openFolders, setOpenFolders] = useState({});

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

    const groupedImages = imageData.reduce((acc, item) => {
        const source = item.source || 'Unknown Source';
        if (!acc[source]) {
            acc[source] = [];
        }
        acc[source].push(item);
        return acc;
    }, {});

    const handleFolderToggle = (source) => {
        setOpenFolders((prev) => ({
            ...prev,
            [source]: !prev[source],
        }));
    };

    const handleImageClick = (item, index) => {
        setSelectedImage(item);
        setCurrentImageIndex(index); // Set the index of the clicked image
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
                setSnackbarMessage('Failed to copy URL');
                setSnackbarOpen(true);
            });
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    // Navigate to the next image
    const goToNextImage = () => {
        setCurrentImageIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            return nextIndex >= imageData.length ? 0 : nextIndex; // Wrap around
        });
    };

    // Navigate to the previous image
    const goToPreviousImage = () => {
        setCurrentImageIndex((prevIndex) => {
            const newPrevIndex = prevIndex - 1;  // Renamed to newPrevIndex to avoid conflict
            return newPrevIndex < 0 ? imageData.length - 1 : newPrevIndex; // Wrap around
        });
    };

    const ImageCard = ({ item, onClick }) => (
        <Card
            onClick={onClick}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                '&:hover': {
                    borderColor: '#0078D7',
                    backgroundColor: '#f5f9ff',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                },
            }}
        >
            <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                <CardMedia
                    component="img"
                    image={item.image_url}
                    alt={item.description || 'Image'}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain', // This ensures the entire image is visible
                        objectPosition: 'center', // Keeps the image centered
                    }}
                />
            </Box>
        </Card>
    );
    
    if (loading) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                height="100vh"
                bgcolor="#ffffff"
            >
                <CircularProgress sx={{ color: '#0078D7' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                height="100vh"
                bgcolor="#ffffff"
            >
                <Typography variant="h6" color="error">
                    Error: {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            height: '100vh', 
            backgroundColor: '#ffffff', 
            display: 'flex', 
            flexDirection: 'column' 
        }}>
            {/* Windows-style title bar */}
            <Box sx={{
                backgroundColor: '#0078D7',
                color: 'white',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FolderIcon sx={{ marginRight: 1 }} />
                    <Typography variant="h6">Image Explorer</Typography>
                </Box>
            </Box>

            {/* Main content area */}
            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Folder Sidebar */}
                <Box sx={{
                    width: 280,
                    borderRight: '1px solid #e0e0e0',
                    backgroundColor: '#f8f9fa',
                    overflowY: 'auto',
                    padding: 2
                }}>
                    {Object.keys(groupedImages).map((source, index) => (
                        <Box
                            key={index}
                            onClick={() => handleFolderToggle(source)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 1,
                                mb: 0.5,
                                cursor: 'pointer',
                                borderRadius: 1,
                                backgroundColor: openFolders[source] ? '#e5f3ff' : 'transparent',
                                '&:hover': {
                                    backgroundColor: openFolders[source] ? '#e5f3ff' : '#f0f0f0'
                                }
                            }}
                        >
                            {openFolders[source] ? 
                                <KeyboardArrowDown sx={{ color: '#666', mr: 1 }} /> :
                                <KeyboardArrowRight sx={{ color: '#666', mr: 1 }} />
                            }
                            <FolderIcon sx={{ 
                                color: openFolders[source] ? '#0078D7' : '#FFC107',
                                mr: 1 
                            }} />
                            <Typography 
                                variant="body2" 
                                sx={{
                                    fontWeight: openFolders[source] ? 600 : 400,
                                    fontSize: '0.875rem' // Reduced font size for folders
                                }}
                            >
                                {source} ({groupedImages[source].length})
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Image grid area */}
                <Box sx={{ 
                    flex: 1,
                    p: 3,
                    overflowY: 'auto',
                    backgroundColor: '#ffffff'
                }}>
                    <Grid container spacing={2}>
                        {Object.entries(groupedImages).map(([source, items]) => (
                            openFolders[source] && items.map((item, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={4} key={`${source}-${index}`}>
                                    <ImageCard item={item} onClick={() => handleImageClick(item, index)} />
                                </Grid>
                            ))
                        ))}
                    </Grid>
                </Box>
            </Box>

            {/* Image details dialog */}
            <Dialog 
                open={openDialog} 
                onClose={handleDialogClose} 
                maxWidth="lg" 
                fullWidth
                PaperProps={{
                    sx: {
                        maxHeight: '90vh',
                        borderRadius: '4px',
                        position: 'relative'
                    }
                }}
            >
                {/* Left Arrow */}
                <IconButton
                    onClick={goToPreviousImage}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        transform: 'translateY(-50%)',
                        zIndex: 100,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        color: 'white',
                        borderRadius: '50%',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        }
                    }}
                >
                    <ChevronLeftIcon />
                </IconButton>

                {/* Right Arrow */}
                <IconButton
                    onClick={goToNextImage}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        right: 0,
                        transform: 'translateY(-50%)',
                        zIndex: 100,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        color: 'white',
                        borderRadius: '50%',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        }
                    }}
                >
                    <ChevronRightIcon />
                </IconButton>

                <DialogTitle 
                    sx={{ 
                        borderBottom: '1px solid #e0e0e0',
                        bgcolor: '#f8f9fa',
                        m: 0,
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="h6">Image Details</Typography>
                    <IconButton onClick={handleDialogClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {selectedImage && (
                        <Box sx={{ display: 'flex', height: '600px' }}>
                            {/* Left side - Image preview */}
                            <Box sx={{ 
                                flex: 2,
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                borderRight: '1px solid #e0e0e0'
                            }}>
                                <Box sx={{ 
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: '#f8f9fa',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        src={imageData[currentImageIndex].image_url}
                                        alt={imageData[currentImageIndex].description}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </Box>

                                {/* URL section */}
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Image URL:
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ContentCopyIcon />}
                                        onClick={() => copyImageUrl(imageData[currentImageIndex].image_url)}
                                        fullWidth
                                        sx={{
                                            textTransform: 'none',
                                            justifyContent: 'flex-start'
                                        }}
                                    >
                                        Copy URL to clipboard
                                    </Button>
                                </Box>
                            </Box>

                            {/* Right side - Details */}
                            <Box sx={{ flex: 1, p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Details
                                </Typography>

                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                        Description
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        {imageData[currentImageIndex].description || 'No description available'}
                                    </Typography>
                                </Box>

                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                        Source
                                    </Typography>
                                    <Typography variant="body1">
                                        {imageData[currentImageIndex].source || 'No source available'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Snackbar notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity="success" 
                    sx={{ 
                        backgroundColor: '#0078D7', 
                        color: 'white',
                        '& .MuiAlert-icon': {
                            color: 'white'
                        }
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ImageDataFetcher;
