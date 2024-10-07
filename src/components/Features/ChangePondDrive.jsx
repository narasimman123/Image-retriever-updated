import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Tooltip,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import '../styles/custom.css';
import { useNavigate } from 'react-router-dom';

const ChangePondDrive = () => {
  const [rows, setRows] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // For search functionality
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // For delete confirmation dialog
  const navigate = useNavigate();

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    const sortedRows = [...rows].sort((a, b) => {
      if (a[property] < b[property]) return isAsc ? -1 : 1;
      if (a[property] > b[property]) return isAsc ? 1 : -1;
      return 0;
    });
    setRows(sortedRows);
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + '/list-blobs');
      const data = await response.json();
      if (data.blobs) {
        setRows(data.blobs);
      }
    } catch (error) {
      setSnackbarMessage('Failed to fetch files.');
      setSnackbarOpen(true);
    }
  };

  const handleFileChangeAndUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

    const invalidFiles = selectedFiles.filter(file => file.type !== validType || file.size > 5 * 1024 * 1024);

    if (invalidFiles.length > 0) {
      setSnackbarMessage('Some files are invalid (type or size). Please upload PPTX files (max 5MB).');
      setSnackbarOpen(true);
      return;
    }

    setUploadedFiles([...uploadedFiles, ...selectedFiles]);
    setSnackbarMessage(`${selectedFiles.length} file(s) selected for upload: ${selectedFiles.map(file => file.name).join(', ')}`);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('file', file);
    });

    try {
      const response = await fetch(process.env.REACT_APP_API_URL + '/upload-blob', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSnackbarMessage('Files uploaded successfully.');
        setSnackbarOpen(true);
        setUploadedFiles([]);
        await fetchFiles();
      } else {
        setSnackbarMessage('Failed to upload files.');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('Error uploading files.');
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (fileName) => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + '/delete-blob', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blob_names: [fileName] }),
      });

      if (response.ok) {
        setSnackbarMessage(`Successfully deleted: ${fileName}`);
        setSnackbarOpen(true);
        await fetchFiles();
      } else {
        setSnackbarMessage('Failed to delete file.');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('Error deleting file.');
      setSnackbarOpen(true);
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const response = await fetch(`http://localhost:5000/download-blob?blob_name=${fileName}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      setSnackbarMessage(`Downloaded: ${fileName}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('There was an error downloading the file:', error);
      setSnackbarMessage('Error downloading the file.');
      setSnackbarOpen(true);
    }
  };

  const handleUploadDelete = (fileName) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.name !== fileName));
    setSnackbarMessage(`Deleted file: ${fileName}`);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleClick = (event, file) => {
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action) => {
    if (action === 'delete') {
      setDeleteDialogOpen(true);
    } else if (action === 'download') {
      handleDownload(selectedFile.name);  // Pass the file name directly
    }
    handleClose();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredRows = rows.filter((row) => 
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const confirmDelete = () => {
    handleDelete(selectedFile.name);
    setDeleteDialogOpen(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <Box style={{ padding: '20px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" gutterBottom>Change Pond Drive</Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      <Paper style={{ padding: '20px' }}>
        <Box mb={2}>
          <TextField
            label="Search Files"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Box>

        <Tooltip title="Upload PPTX files">
          <Button
            variant="contained"
            component="label"
            size="large"
            style={{ margin: '10px' }}
          >
            <AddIcon /> New
            <input
              type="file"
              hidden
              multiple
              accept=".pptx"
              onChange={handleFileChangeAndUpload}
            />
          </Button>
        </Tooltip>

        {uploadedFiles.length > 0 && (
          <Box mt={2} style={{ border: '1px dotted black', padding: '0 10px', borderRadius: '5px' }}>
            <Typography variant="h6">Uploaded Files:</Typography>
            <List>
              {uploadedFiles.map((uploadedFile) => (
                <ListItem key={uploadedFile.name}>
                  <ListItemText primary={uploadedFile.name} />
                  <IconButton
                    color="secondary"
                    onClick={() => handleUploadDelete(uploadedFile.name)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    File Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Last modified</TableCell>
                <TableCell>File size</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>
                      <LocalParkingIcon className="pptx_icons" /> &nbsp;
                      {row.name}
                    </TableCell>
                    <TableCell>{row.modified_date}</TableCell>
                    <TableCell>{row.size}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(event) => handleClick(event, row)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                      >
                        <MenuItem onClick={() => handleMenuItemClick('download')}>Download</MenuItem>
                        <MenuItem onClick={() => handleMenuItemClick('delete')}>Delete</MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No Data Found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to delete {selectedFile ? selectedFile.name : ''}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">Cancel</Button>
          <Button onClick={confirmDelete} color="secondary">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity="info"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default ChangePondDrive;
