import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Link as MuiLink, CircularProgress, Paper, Divider } from '@mui/material';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useSignupModal } from '../SignupModal';
import { login } from '../../store/reducers/authSlice';
import { API_URL } from '../../config';
import { useRouter } from 'next/router'; // Import useRouter for navigation
import Link from 'next/link'; // Use Next.js Link for navigation
const placeholderImage = '/assets/facebook.png';

const LOGIN_TITLE = "Welcome 🥂";
const EMAIL_REQUIRED = 'Email is required';
const EMAIL_INVALID = 'Enter a valid email address';
const PASSWORD_REQUIRED = 'Password is required';

const Login = () => {
  const { previousLocation } = useSignupModal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const router = useRouter(); // Initialize Next.js router
  const dispatch = useDispatch(); // Initialize the dispatch function

  // Load Facebook SDK on component mount
  useEffect(() => {
    // Load Facebook SDK
    window.fbAsyncInit = function () {
      FB.init({
        appId: '569456238888771', // Replace with your actual Facebook App ID
        cookie: true,
        xfbml: true,
        version: 'v21.0', // Use the latest version if possible
      });

      FB.AppEvents.logPageView();
    };

    // Load SDK script
    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = EMAIL_REQUIRED;
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      newErrors.email = EMAIL_INVALID;
    }

    if (!password) {
      newErrors.password = PASSWORD_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        const { token, refreshToken } = response.data;

        // Dispatch the login action to update the Redux store
        dispatch(login({ token, refreshToken }));

        // Navigate to previous page or default to home page if no previous state
        const from = previousLocation || '/';
        // Set the scroll position for index
        sessionStorage.setItem('/', JSON.stringify({ x: 0, y: 0 }));
        router.push(from); // Navigate using Next.js router
      } catch (error) {
        setServerError(error.response?.data?.error || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle Facebook Login
  const handleFacebookLogin = () => {
    FB.login(
      (response) => {
        if (response.authResponse) {
          // Send accessToken to your backend for verification
          axios
            .post(`${API_URL}/auth/facebook`, {
              accessToken: response.authResponse.accessToken,
            })
            .then((res) => {
              const { token, refreshToken } = res.data;
              dispatch(login({ token, refreshToken }));
              router.push('/');
            })
            .catch((error) => {
              setServerError('Facebook login failed. Please try again.');
            });
        } else {
          setServerError('User cancelled login or did not fully authorize.');
        }
      },
      { scope: 'email,public_profile' }
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: { xs: 1, sm: 8 },
        p: 4,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
        {LOGIN_TITLE}
      </Typography>

      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
        sx={{ mb: 3 }}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!errors.password}
        helperText={errors.password}
        sx={{ mb: 3 }}
      />

      <Button
        variant="contained"
        onClick={handleLogin}
        fullWidth
        sx={{ mb: 2, py: 1.5 }}
        disabled={loading}
        endIcon={loading && <CircularProgress size={20} />}
      >
        {loading ? 'Logging in...' : 'Log in'}
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
        <MuiLink component={Link} href="/forgot-password" underline="hover" sx={{ fontWeight: 'bold' }} color="primary.main">
          Forgot your password?
        </MuiLink>
      </Box>

      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
        Don't have an account?{' '}
        <MuiLink component={Link} href="/signup" underline="hover" sx={{ fontWeight: 'bold' }} color="primary">
          Sign up
        </MuiLink>
      </Typography>

      {/* OR Divider */}
      <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
        <Divider sx={{ flexGrow: 1, backgroundColor: '#ccc' }} />
        <Typography
          variant="body2"
          sx={{ mx: 2, color: '#999', fontWeight: 'bold', whiteSpace: 'nowrap' }}
        >
          OR
        </Typography>
        <Divider sx={{ flexGrow: 1, backgroundColor: '#ccc' }} />
      </Box>

      {/* Facebook Login Button */}
      <Button
      variant="outlined"
      onClick={handleFacebookLogin}
      fullWidth
      sx={{
        mb: 2,
        py: 1.5,
        backgroundColor: '#FFFFFF', // White background
        color: '#1877F2', // Facebook Blue text
        textTransform: 'none',
        fontWeight: 'bold',
        borderColor: '#FFFFFF', // Blue border
        '&:hover': {
          backgroundColor: '#f0f0f0', // Light gray on hover
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      startIcon={
          <img
            src={placeholderImage}
            alt="Facebook"
            style={{ width: 24, height: 24 }}
          />
        }
      >
        Continue with Facebook
      </Button>

      {serverError && (
        <Typography variant="body2" color="error" sx={{ mb: 2, textAlign: 'center' }}>
          {serverError}
        </Typography>
      )}
    </Paper>
  );
};

export default Login;
