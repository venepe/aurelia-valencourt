import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Link, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useRouter } from 'next/router';
import axios from 'axios';
import { API_URL } from '../../config';

const RESET_PASSWORD_TITLE = "Set a new password";
const PASSWORD_REQUIRED = 'Password is required';
const PASSWORD_MIN_LENGTH = 'Password must be at least 8 characters long';
const PASSWORD_UPPERCASE_REQUIRED = 'Password must contain at least one uppercase letter';
const PASSWORD_LOWERCASE_REQUIRED = 'Password must contain at least one lowercase letter';
const PASSWORD_NUMBER_REQUIRED = 'Password must contain at least one number';
const PASSWORD_SPECIAL_CHAR_REQUIRED = 'Password must contain at least one special character';
const PASSWORD_CONFIRM_REQUIRED = 'Please confirm your password';
const PASSWORD_MATCH_REQUIRED = 'Passwords must match';

const ResetPassword = ({ onResetPassword }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [openDialog, setOpenDialog] = useState(false); // State to manage success dialog visibility
  const [openErrorDialog, setOpenErrorDialog] = useState(false); // State to manage error dialog visibility
  const [dialogMessage, setDialogMessage] = useState(''); // State for dialog message
  const router = useRouter(); // Initialize Next.js router

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = PASSWORD_REQUIRED;
    } else if (password.length < 8) {
      newErrors.password = PASSWORD_MIN_LENGTH;
    }
    // else if (!/[A-Z]/.test(password)) {
    //   newErrors.password = PASSWORD_UPPERCASE_REQUIRED;
    // } else if (!/[a-z]/.test(password)) {
    //   newErrors.password = PASSWORD_LOWERCASE_REQUIRED;
    // } else if (!/\d/.test(password)) {
    //   newErrors.password = PASSWORD_NUMBER_REQUIRED;
    // } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    //   newErrors.password = PASSWORD_SPECIAL_CHAR_REQUIRED;
    // }

    if (!confirmPassword) {
      newErrors.confirmPassword = PASSWORD_CONFIRM_REQUIRED;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = PASSWORD_MATCH_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (validateForm()) {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      try {
        const response = await axios.post(`${API_URL}/auth/reset-password`, {
          password,
          token,
        });

        if (response.status === 200) {
          setDialogMessage('Password reset successful. You can now log in with your new password.');
          setOpenDialog(true); // Open success dialog
        }
      } catch (error) {
        let errorMessage = 'Failed to reset password';
        if (error.response) {
          errorMessage = `Error: ${error.response.data.error}`;
        } else if (error.request) {
          errorMessage = 'No response from server. Please try again later.';
        }
        setDialogMessage(errorMessage);
        setOpenErrorDialog(true); // Open error dialog
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    router.push('/login'); // Navigate to login page on success dialog close
  };

  const handleCloseErrorDialog = () => {
    setOpenErrorDialog(false); // Close the error dialog
  };

  return (
    <Box
      sx={{
        width: 400, mx: 'auto', mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2
      }}
    >
      <Typography variant='h5' sx={{ mb: 3, textAlign: 'center' }}>
        {RESET_PASSWORD_TITLE}
      </Typography>

      <TextField
        fullWidth
        label='New Password'
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!errors.password}
        helperText={errors.password}
        sx={{ mb: 3 }}
      />
      <TextField
        fullWidth
        label='Confirm New Password'
        type='password'
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        sx={{ mb: 3 }}
      />

      <Button
        variant='contained'
        onClick={handleResetPassword}
        fullWidth
        sx={{ mb: 2 }}
      >
        Reset Password
      </Button>

      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
        Remember your password?{' '}
        <Link href="/login" underline="hover">
          Log in
        </Link>
      </Typography>

      {/* Success Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Okay
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={openErrorDialog} onClose={handleCloseErrorDialog}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorDialog} color="primary">
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResetPassword;
