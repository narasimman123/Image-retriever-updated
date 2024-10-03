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
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import '../styles/custom.css';
import AddIcon from '@mui/icons-material/Add';
const ChangePondDrive = () => {
  const [rows, setRows] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name'); // Set to 'name' for sorting
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

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
      const response = await fetch(process.env.REACT_APP_API_URL +'/list-blobs');
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
      const response = await fetch(process.env.REACT_APP_API_URL +'/upload-blob', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSnackbarMessage('Files uploaded successfully.');
        setSnackbarOpen(true);
        setUploadedFiles([]); // Clear uploaded files after successful upload
        await fetchFiles(); // Fetch the updated list of files
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
      const response = await fetch(process.env.REACT_APP_API_URL +'/delete-blob', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blob_names: [fileName] }),
      });

      if (response.ok) {
        setSnackbarMessage(`Successfully deleted: ${fileName}`);
        setSnackbarOpen(true);
        await fetchFiles(); // Fetch the updated list after deletion
      } else {
        setSnackbarMessage('Failed to delete file.');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('Error deleting file.');
      setSnackbarOpen(true);
    }
  };

  const handleDownload = (url, fileName) => {
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName; // Set the filename for the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href); // Clean up the URL object
      })
      .catch(error => {
        console.error('There was an error downloading the file:', error);
      });
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
      handleDelete(selectedFile.name);
    } else if (action === 'download') {
      handleDownload(selectedFile.url, selectedFile.name);
    }
    handleClose();
  };

  useEffect(() => {
    fetchFiles(); // Fetch files on component mount
  }, []);

  return (
    <Box style={{ padding: '20px' }}>
      <Typography variant="h5" gutterBottom>Change Pond Drive</Typography>
      <Paper style={{ padding: '20px' }}>
        <Tooltip title="Upload PPTX files">
          <Button
            variant="contained"
            component="label"
            size="large"
            style={{ margin: '10px' }}
          >
           <AddIcon/> New
            <input
              type="file"
              hidden
              multiple
              accept=".pptx"
              onChange={handleFileChangeAndUpload}
            />
          </Button>
        </Tooltip>

        {/* Display uploaded files */}
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
                    active={orderBy === 'name'} // Check against 'name'
                    direction={orderBy === 'name' ? order : 'asc'} // Check against 'name'
                    onClick={() => handleRequestSort('name')} // Update to 'name'
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
              {rows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell>
                    <LocalParkingIcon className='pptx_icons' /> &nbsp;&nbsp;
                    <span>{row.name}</span> &nbsp;&nbsp;
                    {/* <GroupIcon className='group_icons_fs' /> */}
                  </TableCell>
                  <TableCell>May 23 2020</TableCell>
                  <TableCell>807 KB</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="inherit"
                      onClick={(event) => handleClick(event, row)} // Open menu for actions
                    >
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <MuiAlert elevation={6} variant="filled" onClose={handleSnackbarClose} severity="success">
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default ChangePondDrive;
