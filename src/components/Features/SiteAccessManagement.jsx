import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

// Validation schema
const validationSchema = Yup.object({
  username: Yup.string()
    .matches(/^[A-Za-z]+$/, 'Username must contain only alphabets')
    .required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const Alert = React.forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const SiteAccessManagement = () => {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_API_URL + '/users/list');
      setUsers(response.data);
    } catch (error) {
      showSnackbar('Error fetching users', 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (values, { resetForm }) => {
    try {
      await axios.post(process.env.REACT_APP_API_URL + '/users/add', values);
      showSnackbar('User added successfully.');
      fetchUsers();
      resetForm();
      setOpen(false);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add user';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleEditUser = async (values, { resetForm }) => {
    try {
      await axios.put(process.env.REACT_APP_API_URL + '/users/edit', {
        email: currentUser.email,
        username: values.username,
        status: values.status,
      });
      showSnackbar('User updated successfully.');
      fetchUsers();
      resetForm();
      setOpen(false);
      setCurrentUser(null);
    } catch (error) {
      showSnackbar('Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.post(process.env.REACT_APP_API_URL + '/users/delete', { email: userToDelete.email });
      showSnackbar('User deleted successfully.');
      fetchUsers();
      setConfirmDeleteOpen(false);
      setUserToDelete(null);
    } catch (error) {
      showSnackbar('Failed to delete user', 'error');
    }
  };

  const handleOpenDialog = (user = null) => {
    setCurrentUser(user);
    setEditMode(!!user);
    setOpen(true);
  };

  const handleSort = (key) => {
    const order = sortOrder === 'asc' ? 'desc' : 'asc';
    const sortedUsers = [...users].sort((a, b) => {
      return order === 'asc' ? (a[key] > b[key] ? 1 : -1) : (a[key] < b[key] ? 1 : -1);
    });
    setUsers(sortedUsers);
    setSortOrder(order);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <Box style={{ padding: '20px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" gutterBottom>Site Access Management</Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenDialog()}
        style={{ marginBottom: '20px' }}
      >
        Add User
      </Button>

      <TableContainer component={Paper} style={{ padding: '1%', width: '99%' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('username')} style={{ cursor: 'pointer' }}>
                Username
              </TableCell>
              <TableCell onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                Email
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {users.length === 0 || users.filter(user => user.role_id !== 1).length === 0 ? (
    <TableRow>
      <TableCell colSpan={5} align="center">
        <Typography variant="body1" color="textSecondary">
          No Data Found
        </Typography>
      </TableCell>
    </TableRow>
  ) : (
    users.map((user, index) => (
      user.role_id !== 1 && (
        <TableRow key={index}>
          <TableCell>{user.username}</TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>{user.status === 1 ? 'Active' : 'Inactive'}</TableCell>
          <TableCell>
            <Button
              color="primary"
              onClick={() => handleOpenDialog(user)}
              style={{ marginRight: '10px' }}
            >
              <EditIcon style={{ fontSize: '18px' }} /> Edit
            </Button>
          </TableCell>
          <TableCell>
            <Button
              color="secondary"
              onClick={() => {
                setUserToDelete(user);
                setConfirmDeleteOpen(true);
              }}
            >
              <DeleteIcon style={{ fontSize: '18px' }} /> Delete
            </Button>
          </TableCell>
        </TableRow>
      )
    ))
  )}
</TableBody>

        </Table>
      </TableContainer>
      
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editMode ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent sx={{ width: '500px' }}>
          <Formik
            initialValues={{
              username: editMode && currentUser ? currentUser.username : '',
              email: editMode && currentUser ? currentUser.email : '',
              status: editMode && currentUser ? currentUser.status : '1', // Default status for editing
            }}
            validationSchema={validationSchema}
            onSubmit={editMode ? handleEditUser : handleAddUser}
          >
            {({ errors, touched, setFieldValue }) => (
              <Form>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="username"
                    label="Username"
                    fullWidth 
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="email"
                    label="Email"
                    fullWidth 
                    disabled={editMode}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Box>
                {editMode && (
                  <Box mb={2}>
                    <InputLabel>Status</InputLabel>
                    <FormControl fullWidth>
                      <Field
                        as={Select}
                        name="status"
                        onChange={(event) => setFieldValue("status", event.target.value)}
                        error={touched.status && Boolean(errors.status)}
                      >
                        <MenuItem value="1">Active</MenuItem>
                        <MenuItem value="0">Inactive</MenuItem>
                      </Field>
                    </FormControl>
                  </Box>
                )}
                <DialogActions>
                  <Button onClick={() => setOpen(false)} color="primary">
                    Cancel
                  </Button>
                  <Button type="submit" color="primary">
                    {editMode ? 'Update User' : 'Add User'}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="primary">
            No
          </Button>
          <Button onClick={handleDeleteUser} color="secondary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SiteAccessManagement;
