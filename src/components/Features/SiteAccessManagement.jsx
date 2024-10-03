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

// Validation schema
const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});

// Alert component for Snackbar
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

  const fetchUsers = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_API_URL +'/users');
      setUsers(response.data); // Assuming response data is an array of users
    } catch (error) {
      showSnackbar('Error fetching users', 'error');
    }
  };

  useEffect(() => {
    fetchUsers(); // Call the function on component mount
  }, []); // Empty array means it runs once on mount

  const handleAddUser = async (values, { resetForm }) => {
    try {
      await axios.post(process.env.REACT_APP_API_URL +'/users/add', values);
      showSnackbar('User added successfully.');
      fetchUsers(); // Refresh the user list
      resetForm();
      setOpen(false);
    } catch (error) {
      showSnackbar('Failed to add user', 'error');
    }
  };

  const handleEditUser = async (values, { resetForm }) => {
    try {
      await axios.post(process.env.REACT_APP_API_URL +'/users/edit', {
        email: currentUser.email,
        username: values.username,
        status: values.status,
      });
      showSnackbar('User updated successfully.');
      fetchUsers(); // Refresh the user list
      resetForm();
      setOpen(false);
      setCurrentUser(null);
    } catch (error) {
      showSnackbar('Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (email) => {
    try {
      await axios.post(process.env.REACT_APP_API_URL +'/users/delete', { email });
      showSnackbar('User deleted successfully.');
      fetchUsers(); // Refresh the user list
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
      if (order === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      } else {
        return a[key] < b[key] ? 1 : -1;
      }
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

  return (
    <Box style={{ padding: '20px' }}>
      <Typography variant="h5" style={{ textAlign: 'center' }}>
        Site Access Management
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenDialog()}
        style={{ marginBottom: '20px' }}
      >
        Add User
      </Button>

      <TableContainer component={Paper}>
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>
                  <Button
                    color="primary"
                    onClick={() => handleOpenDialog(user)}
                    style={{ marginRight: '10px' }}
                  >
                    Edit
                  </Button>
                  <Button color="secondary" onClick={() => handleDeleteUser(user.email)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
              status: editMode && currentUser ? currentUser.status : 'Active', // Default status
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
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Box>
                <Box mb={2}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Field
                      as={Select}
                      name="status"
                      onChange={(event) => setFieldValue("status", event.target.value)}
                      error={touched.status && Boolean(errors.status)}
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Field>
                  </FormControl>
                </Box>
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

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SiteAccessManagement;