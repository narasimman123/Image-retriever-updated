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
  Breadcrumbs,CircularProgress
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import LogoutIcon from '@mui/icons-material/Logout';
import '../styles/custom.css';
import { useNavigate } from 'react-router-dom';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const ChangePondDrive = () => {
  const [rows, setRows] = useState([]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadMenuAnchorEl, setUploadMenuAnchorEl] = useState(null);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [currentPath, setCurrentPath] = useState('');

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    const sortedRows = [...files].sort((a, b) => {
      if (a[property] < b[property]) return isAsc ? -1 : 1;
      if (a[property] > b[property]) return isAsc ? 1 : -1;
      return 0;
    });
    setFiles(sortedRows);
  };

  const fetchFiles = async (folder = '') => {
    try {
      // const response = await fetch(
      //   `${process.env.REACT_APP_API_URL}/list-blobs?path=${currentPath}`
      // );
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/list-all-blobs?folder=${folder}`);
      const data = await response.json();
      if (data.blobs) {
        const uniqueFolders = new Set();
        const fileList = [];
        if(!folder){
          data.blobs.forEach((blob) => {
            const pathParts = blob.name.split('/');
            if (pathParts.length > 1) {
              uniqueFolders.add(pathParts[0]);
            } else {
              fileList.push(blob);
            }
          });
        }else {
          data.blobs.forEach((blob) => {
            const pathParts = blob.name.split('/');
            if (pathParts[0] === folder) {
              fileList.push({
                name: pathParts[pathParts.length - 1],
                modified_date:blob.modified_date,
                size:blob.size,
                type:blob.type,
                path:blob.path
              });
            }
          });
        }
        setLoading(false);
        setFolders(Array.from(uniqueFolders));
        setFiles(fileList);
        setRows(fileList); // Keeping rows for sorting and searching
      }
    } catch (error) {
      setSnackbarMessage('Failed to fetch files.');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleFileChangeAndUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validType =
      'application/vnd.openxmlformats-officedocument.presentationml.presentation';

    const invalidFiles = selectedFiles.filter(
      (file) => file.type !== validType || file.size > 5 * 1024 * 1024
    );

    if (invalidFiles.length > 0) {
      setSnackbarMessage(
        'Some files are invalid (type or size). Please upload PPTX files (max 5MB).'
      );
      setSnackbarOpen(true);
      return;
    }

    setUploadedFiles([...uploadedFiles, ...selectedFiles]);
    setSnackbarMessage(
      `${selectedFiles.length} file(s) selected for upload: ${selectedFiles
        .map((file) => file.name)
        .join(', ')}`
    );
    setSnackbarOpen(true);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('file', file);
    });
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/upload-blob?path=${currentPath}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        setSnackbarMessage('Files uploaded successfully.');
        setSnackbarOpen(true);
        setUploadedFiles([]);
        setLoading(false);
        await fetchFiles();
      } else {
        setSnackbarMessage('Failed to upload files.');
        setSnackbarOpen(true);
        setLoading(false);
      }
    } catch (error) {
      setSnackbarMessage('Error uploading files.');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleDelete = async (fileName) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/delete-blob`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blob_names: currentPath
              ? `${currentPath}/${fileName}`
              : fileName,
          }),
        }
      );

      if (response.ok) {
        setSnackbarMessage(`Successfully deleted: ${fileName}`);
        setSnackbarOpen(true);
        await fetchFiles();
      } else {
        setSnackbarMessage('Failed to delete file.');
        setSnackbarOpen(true);
      }
      setLoading(false);
    } catch (error) {
      setSnackbarMessage('Error deleting file.');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleDownload = async (fileName) => {
    setLoading(true);
    try {
      const blobName = currentPath ? `${currentPath}/${fileName}` : fileName;
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/download-blob?blob_name=${encodeURIComponent(
          blobName
        )}`
      );

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
      setLoading(false);
    } catch (error) {
      console.error('There was an error downloading the file:', error);
      setSnackbarMessage('Error downloading the file.');
      setSnackbarOpen(true);
      setLoading(false);
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
      handleDownload(selectedFile.name);
    }
    handleClose();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const handleFolderClick = (folderName) => {
    setCurrentPath('')
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
    fetchFiles(folderName);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) return;
    const pathParts = currentPath.split('/');
    const newPath = pathParts.slice(0, index + 1).join('/');
    setCurrentPath(newPath);
  };

  const handleUploadMenuClick = (event) => {
    setUploadMenuAnchorEl(event.currentTarget);
  };

  const handleUploadMenuClose = () => {
    setUploadMenuAnchorEl(null);
  };

  const handleFolderUploadClick = () => {
    setCreateFolderDialogOpen(true);
    handleUploadMenuClose();
  };

  const handleFileUploadClick = () => {
    // Trigger file input click
    document.getElementById('file-upload-input').click();
    handleUploadMenuClose();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setSnackbarMessage('Folder name cannot be empty.');
      setSnackbarOpen(true);
      return;
    }

    const payload = {
      folder_name: currentPath
        ? `${currentPath}/${newFolderName.trim()}`
        : newFolderName.trim(),
    };

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/create-folder`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setSnackbarMessage('Folder created successfully.');
        setSnackbarOpen(true);
        setCreateFolderDialogOpen(false);
        setNewFolderName('');
        setLoading(false);
        await fetchFiles();
      } else {
        setSnackbarMessage('Failed to create folder.');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('Error creating folder.');
      setSnackbarOpen(true);
    }
  };
const handleRootClick =()=>{
  setCurrentPath('');
  fetchFiles();
}
  return (
    <Box style={{ padding: '20px' }}>
       {loading && (
        <Box  display="flex" 
        justifyContent="center" 
        alignItems="center" 
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgb(89 82 82 / 18%)',
          backdropFilter: 'blur(1px)', // Blur effect
          zIndex: 9999,
        }} >
          <CircularProgress />
        </Box>
      )}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Breadcrumbs aria-label="breadcrumb">
          <Button
            color="inherit"
            onClick={() => handleRootClick('')}
            disabled={currentPath === ''}
          >
            Root
          </Button>
          {currentPath.split('/').map((folder, index) => (
            <Button
              key={index}
              color="inherit"
              onClick={() => handleBreadcrumbClick(index)}
              disabled={index === currentPath.split('/').length - 1}
            >
              {folder}
            </Button>
          ))}
        </Breadcrumbs>
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

        <Box mb={2}>
          <Tooltip title="Upload Options">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleUploadMenuClick}
              aria-controls="upload-menu"
              aria-haspopup="true"
            >
              New
            </Button>
          </Tooltip>
          <Menu
            id="upload-menu"
            anchorEl={uploadMenuAnchorEl}
            keepMounted
            open={Boolean(uploadMenuAnchorEl)}
            onClose={handleUploadMenuClose}
          >
            <MenuItem onClick={handleFileUploadClick}>
              <UploadFileIcon style={{ marginRight: '8px' }} />
              File Upload
            </MenuItem>
            <MenuItem onClick={handleFolderUploadClick}>
              <CreateNewFolderIcon style={{ marginRight: '8px' }} />
              Create Folder
            </MenuItem>
          </Menu>
          <input
            id="file-upload-input"
            type="file"
            hidden
            multiple
            accept=".pptx"
            onChange={handleFileChangeAndUpload}
          />
        </Box>

        {uploadedFiles.length > 0 && (
          <Box
            mt={2}
            style={{
              border: '1px dotted black',
              padding: '0 10px',
              borderRadius: '5px',
            }}
          >
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
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Last Modified</TableCell>
                <TableCell>File Size</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPath && folders.length === 0 && files.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body1" color="textSecondary">
                      This folder is empty.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {folders.length > 0 && (
                <>
                  {folders.map((folder) => (
                    <TableRow
                      key={folder}
                      hover
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleFolderClick(folder)}
                    >
                      <TableCell>
                        <CreateNewFolderIcon style={{ marginRight: '8px' }} />
                        {folder}
                      </TableCell>
                      <TableCell colSpan={3}></TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file) => (
                  <TableRow key={file.name}>
                    <TableCell>
                      <LocalParkingIcon className="pptx_icons" /> &nbsp;
                      {file.name}
                    </TableCell>
                    <TableCell>{file.modified_date}</TableCell>
                    <TableCell>{file.size}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(event) => handleClick(event, file)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && selectedFile?.name === file.name}
                        onClose={handleClose}
                      >
                        <MenuItem onClick={() => handleMenuItemClick('download')}>
                          Download
                        </MenuItem>
                        <MenuItem onClick={() => handleMenuItemClick('delete')}>
                          Delete
                        </MenuItem>
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

      {/* Create Folder Dialog */}
      <Dialog
        open={createFolderDialogOpen}
        onClose={() => setCreateFolderDialogOpen(false)}
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the name of the new folder.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            type="text"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFolderDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateFolder} color="secondary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to delete{' '}
            {selectedFile ? selectedFile.name : ''}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Delete
          </Button>
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
