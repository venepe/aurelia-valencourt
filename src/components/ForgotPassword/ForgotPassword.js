import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Link, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import axios from 'axios';
import { API_URL } from '../../config';

const FORGOT_PASSWORD_TITLE = "Reset your password";
const EMAIL_REQUIRED = 'Email is required';
const EMAIL_INVALID = 'Enter a valid email address';

const ForgotPassword = ({ onReset }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [openDialog, setOpenDialog] = useState(false); // State to manage success dialog visibility
  const [openErrorDialog, setOpenErrorDialog] = useState(false); // State to manage error dialog visibility
  const [dialogMessage, setDialogMessage] = useState(''); // State for dialog message

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = EMAIL_REQUIRED;
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      newErrors.email = EMAIL_INVALID;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (validateForm()) {
      try {
        const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });

        if (response.status === 200) {
          setOpenDialog(true); // Open the dialog after success
          setEmail(''); // Reset the email input
          setErrors({}); // Reset any form errors
        }
      } catch (error) {
        let errorMessage = 'Failed to send reset email';
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = 'Email not found. Please check the email address and try again.';
          } else {
            errorMessage = `Error: ${error.response.data.error}`;
          }
        } else if (error.request) {
          errorMessage = 'No response from server. Please try again later.';
        }
        setDialogMessage(errorMessage);
        setOpenErrorDialog(true); // Open the error dialog
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseErrorDialog = () => {
    setOpenErrorDialog(false);
  };

  return (
    <Box
      sx={{
        width: 400, mx: 'auto', mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2
      }}
    >
      <Typography variant='h5' sx={{ mb: 3, textAlign: 'center' }}>
        {FORGOT_PASSWORD_TITLE}
      </Typography>

      <TextField
        fullWidth
        label='Email'
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
        sx={{ mb: 3 }}
      />

      <Button
        variant='contained'
        onClick={handleReset}
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

      {/* Dialog to notify success */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Password reset email sent successfully. Please check your inbox for further instructions.
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

export default ForgotPassword;
