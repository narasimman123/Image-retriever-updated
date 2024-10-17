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
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import LogoutIcon from '@mui/icons-material/Logout';
import '../styles/custom.css';
import { useNavigate } from 'react-router-dom';
import FilePresentIcon from '@mui/icons-material/FilePresent';
const ChangePondDrive = ({redirectLink,setRedirectLink }) => {
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
  const [folderDeleteDialogOpen,setFolderDeleteDialogOpen] =  useState({});
  const [folderDeleteShowHide,setFolderDeleteShowHide] =  useState(false);
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
    const sortedRows = [...rows].sort((a, b) => {
      if (a[property] < b[property]) return isAsc ? -1 : 1;
      if (a[property] > b[property]) return isAsc ? 1 : -1;
      return 0;
    });
    setRows(sortedRows)
  };

  const fetchFiles = async (folder = '') => {
    try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/list-all-blobs?folder=${folder}`);
        const data = await response.json();
                if (data.blobs) {
            const uniqueFolders = data.blobs.folders.map(blob => ({
                name: blob.name,
                type: "folder",
                files:blob.files
            }));
            const fileList = data.blobs.root_files.map(blob => ({
                ...blob,
                type: "file"
            }));
            const output = [...fileList, ...uniqueFolders];
            setLoading(false);
            setFolders(uniqueFolders); // Set unique folders 
            setFiles(fileList); // Set files
            setRows(output); 
            setRedirectLink(false);
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
      formData.append('folder',currentPath)
    });
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/upload-blob`,
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
        if(!currentPath){
        await fetchFiles();
        }else {
          handleFolderClick(currentPath)
        }
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
        `${process.env.REACT_APP_API_URL}/delete-blobs`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paths: [currentPath
              ? `${currentPath}/${fileName}`
              : fileName,
          ]}),
        }
      );

      if (response.ok) {
        setSnackbarMessage(`Successfully deleted: ${fileName}`);
        setSnackbarOpen(true);
        if (currentPath) {
          await handleFolderClick(currentPath);
        } else {
          await fetchFiles();
        }
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
  const handleFolderDelete = async (fileNames) =>{
    console.log(fileNames)
    setLoading(true);
    let blobNames = fileNames.fileData.files.length > 0 ? fileNames.fileData.files.map(file => `${fileNames.fileData.name}/${file.name}`) : [fileNames.fileData.name + '/'];
    console.log(blobNames)
    if(fileNames.fileData && fileNames.fileData.type === "folder" && fileNames.fileData.files.length > 0){
      blobNames.push(fileNames.fileData.name+'/')
    }
    const payload = JSON.stringify({
        paths: blobNames
    });
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/delete-blobs`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
        }
      );

      if (response.ok) {
        setSnackbarMessage(`Successfully deleted: ${fileNames.fileData.nam||""}`);
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
  }
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

  const handleMenuItemClick = (action,data='') => {
    if (action === 'delete') {
      setDeleteDialogOpen(true);
    } else if (action === 'download') {
      handleDownload(data);
    } else if (action === 'folderDelete'){
      setFolderDeleteDialogOpen({"showHide":true,fileData : data});
      setFolderDeleteShowHide(true)
    }
    handleClose();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredFiles = rows.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setFolderDeleteDialogOpen(folderDeleteDialogOpen.showHide=false);
    setFolderDeleteShowHide(false);
  };

  const confirmDelete = () => {
    handleDelete(selectedFile.name);
    setDeleteDialogOpen(false);
  };
  const confirmFolderDelete =()=>{
    handleFolderDelete (folderDeleteDialogOpen);
    setFolderDeleteDialogOpen(folderDeleteDialogOpen.showHide=false);
    setFolderDeleteShowHide(false)
  }
  useEffect(() => {
    fetchFiles();
    if(redirectLink){
      setCurrentPath('')
    }
  }, [redirectLink]);
  
  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('user');
    navigate('/admin/login');
  };

  const handleFolderClick = async (folderName = '') => {
    if(!currentPath){
    setCurrentPath('');
    const newPath = currentPath ? `${currentPath}/${folderName.name}` : folderName.name;
    setCurrentPath(newPath);
    }
    setLoading(true);
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/list-blobs-folder`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ "folder": folderName.name||folderName }),
        }
      );
      const data = await response.json();
      setLoading(false);
      if (data && data.files.length > 0) {
        const fileList = data.files.map(blob => ({
          ...blob,
          type: "file"
        }));
        setLoading(false);
        setFiles(fileList);
        setRows(fileList);
      } else {
        setRows([]);
      }
    } catch (error) {
      setSnackbarMessage('Failed to fetch files.');
      setSnackbarOpen(true);
      setLoading(false);
    }
    // // Create or update the query parameter for folderName
    // const params = new URLSearchParams(window.location.search);
    // params.set('folderName', newPath); // Set the folderName query param

    // // Update the URL with the new query parameters
    // navigate(`?${params.toString()}`, { replace: true });

    // const fileList = folderName.files.map(blob => ({
    //     ...blob,
    //     type: "file"
    // }));

    // setRows(fileList);
    // setLoading(false);
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
        const errorData = await response.json();
        setSnackbarMessage(errorData.error || 'Failed to create folder.');
        setSnackbarOpen(true);
        setLoading(false);
      }
    } catch (error) {
      setSnackbarMessage('Error creating folder.');
      setSnackbarOpen(true);
      setLoading(false);
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
            {!currentPath && <MenuItem onClick={handleFolderUploadClick}>
              <CreateNewFolderIcon style={{ marginRight: '8px' }} />
              Create Folder
            </MenuItem>
            }
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
              {filteredFiles.length > 0 ? (
                filteredFiles.map(item => (
                  <TableRow
                    key={item.name}
                    hover
                    style={{ cursor: item.type === 'folder' ? 'pointer' : 'default' }}
                  >
                    <TableCell>
                      {item.type === 'folder' ? (
                        <>
                        <span className="icon-text" onClick={item.type === 'folder' ? () => handleFolderClick(item) : undefined}>
                          <CreateNewFolderIcon className='customFolderIcon'/>
                          &nbsp;{item.name}
                        </span>
                        </>
                      ) : (
                        <>
                            <span className="icon-text" >
                              <FilePresentIcon className="pptx_icons" /> &nbsp;
                              {item.name}
                            </span>
                        </>
                      )}
                    </TableCell>
                    {item.type === 'file' && (
                      <>
                        <TableCell>{item.modified_date}</TableCell>
                        <TableCell>{item.size}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={(event) => handleClick(event, item)}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedFile?.name === item.name}
                            onClose={handleClose}
                          >
                            <MenuItem onClick={() => handleMenuItemClick('download',item.name)}>
                              Download
                            </MenuItem>
                            <MenuItem onClick={() => handleMenuItemClick('delete', item.name)}>
                              Delete
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </>
                    )}
                    {item.type === 'folder' && (
                      <>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell align="center">
                        <IconButton onClick={(event) => handleClick(event, item)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedFile?.name === item.name}
                          onClose={handleClose}
                        >
                          <MenuItem onClick={() => handleMenuItemClick('folderDelete', item)}>
                            Delete
                          </MenuItem>
                        </Menu>
                      </TableCell>
                      </>
                    )}
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
      {/* end delete file confirmation */}
      {/*  Start folder delete confirmation */}
      <Dialog open={folderDeleteShowHide} onClose={handleDeleteDialogClose}>
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
          <Button onClick={confirmFolderDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* end folder confirmation */}
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
