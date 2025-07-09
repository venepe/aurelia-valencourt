import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Grid,
  Checkbox,
  FormControlLabel,
  TextField,
  Link as MuiLink,
  Paper,
  IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useSignupModal } from '../SignupModal';
import { login } from '../../store/reducers/authSlice';
import { API_URL } from '../../config';
import { useRouter } from 'next/router';
import Link from 'next/link';
import theme from '../../theme.js';

const placeholderImage = '/assets/background_square.png';

const SIGNUP_TITLE = "Let’s get started!";
const INGREDIENTS_TITLE = 'Select your favorite ingredients';
const FLAVOR_PROFILE_TITLE = 'Select your flavor profiles';
const SIGNUP_CHECKBOX_LABEL = "Yes, I'd like to sign up for messages and be first to know about cocktails personalized just for me.";

const SignupPreferences = () => {
  const { previousLocation } = useSignupModal();
  const [step, setStep] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedFlavorProfiles, setSelectedFlavorProfiles] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubscribed, setSubscribe] = useState(true);
  const [errors, setErrors] = useState({});
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [showAllFlavorProfiles, setShowAllFlavorProfiles] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const [ingredients, setIngredients] = useState([]);
  const [flavorProfiles, setFlavorProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Fetch ingredients and flavor profiles from the API
  useEffect(() => {
    const fetchIngredientsAndFlavors = async () => {
      try {
        const response = await axios.get(`${API_URL}/ingredients-and-flavors`);
        const { ingredients, flavors } = response.data;

        setIngredients(ingredients);
        setFlavorProfiles(flavors);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setLoading(false);
      }
    };

    fetchIngredientsAndFlavors();
  }, []);

  if (loading) return <LinearProgress sx={{ width: '100%', mt: 4 }} />;

  const handleImageLoad = (tagId) => {
    setLoadedImages((prev) => ({ ...prev, [tagId]: true }));
  };

  const handleIngredientChange = (tagId) => {
    setSelectedIngredients((prevIngredients) =>
      prevIngredients.includes(tagId)
        ? prevIngredients.filter((i) => i !== tagId)
        : [...prevIngredients, tagId]
    );
  };

  const handleFlavorProfileSelect = (profile) => {
    setSelectedFlavorProfiles((prevProfiles) =>
      prevProfiles.includes(profile)
        ? prevProfiles.filter((p) => p !== profile)
        : [...prevProfiles, profile]
    );
  };

  const displayedIngredients = showAllIngredients ? ingredients : ingredients.slice(0, 6);
  const displayedFlavorProfiles = showAllFlavorProfiles ? flavorProfiles : flavorProfiles.slice(0, 6);

  const validateStep3 = () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters long';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1 && selectedIngredients.length > 0) setStep(2);
    else if (step === 2 && selectedFlavorProfiles.length > 0) setStep(3);
    else if (step === 3 && validateStep3()) {
      try {
        const response = await axios.post(`${API_URL}/auth/signup`, {
          email,
          password,
          firstName,
          lastName,
          ingredients: selectedIngredients,
          flavors: selectedFlavorProfiles,
          isSubscribed,
        });

        if (response.status === 201) {
          const { token, refreshToken } = response.data;

          dispatch(login({ token, refreshToken }));
          const from = previousLocation || '/';
          // Set the scroll position for index
          sessionStorage.setItem('/', JSON.stringify({ x: 0, y: 0 }));
          router.push(from);
        }
      } catch (error) {
        console.error('Registration failed:', error);
        setErrors({ form: 'Registration failed, please try again.' });
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSkip = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: 4,
        p: 3,
        borderRadius: 3,
        bgcolor: 'background.paper',
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
      }}
    >
      <LinearProgress
        aria-label="progress to sign up"
        variant='determinate'
        value={step === 1 ? 33 : step === 2 ? 66 : 100}
        sx={{ mb: 4, borderRadius: 1 }}
      />

      {step === 1 && (
        <Box>
          <Typography variant='h5' sx={{ mb: 3, textAlign: 'center', fontWeight: 'medium', color: 'text.primary' }}>
            {INGREDIENTS_TITLE}
          </Typography>

          <Grid container spacing={2}>
            {displayedIngredients.map(({ tagId, tagName, url }) => (
              <Grid item xs={6} sm={4} key={tagId}>
                <Paper
                  elevation={selectedIngredients.includes(tagId) ? 6 : 1}
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedIngredients.includes(tagId)
                      ? `3px solid ${theme.palette.primary.main}`
                      : '1px solid #ccc',
                    boxShadow: selectedIngredients.includes(tagId)
                      ? '0 4px 10px rgba(0, 0, 0, 0.1)'
                      : 'none',
                    transition: 'border 0.3s ease, box-shadow 0.3s ease',
                  }}
                  onClick={() => handleIngredientChange(tagId)}
                >
                  <img
                    src={loadedImages[tagId] ? url : placeholderImage}
                    alt={tagName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onLoad={() => handleImageLoad(tagId)}
                  />
                  {selectedIngredients.includes(tagId) && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: '#fff',
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: '50%',
                        padding: '4px',
                      }}
                    >
                      <CheckCircleIcon />
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>

          {ingredients.length > 6 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <IconButton aria-label="more" onClick={() => setShowAllIngredients(!showAllIngredients)}>
                {showAllIngredients ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          )}
        </Box>
      )}

      {step === 2 && (
        <Box>
          <Typography variant='h5' sx={{ mb: 3, textAlign: 'center', fontWeight: 'medium', color: 'text.primary' }}>
            {FLAVOR_PROFILE_TITLE}
          </Typography>

          <Grid container spacing={2}>
            {displayedFlavorProfiles.map(({ tagId, tagName }) => (
              <Grid item xs={6} key={tagId}>
                <Paper
                  elevation={selectedFlavorProfiles.includes(tagId) ? 6 : 1}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 60,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: selectedFlavorProfiles.includes(tagId) ? `3px solid ${theme.palette.primary.main}` : '1px solid #ccc',
                    transition: 'background-color 0.3s ease, border 0.3s ease',
                  }}
                  onClick={() => handleFlavorProfileSelect(tagId)}
                >
                  <Typography>{tagName}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {flavorProfiles.length > 6 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <IconButton onClick={() => setShowAllFlavorProfiles(!showAllFlavorProfiles)}>
                {showAllFlavorProfiles ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          )}
        </Box>
      )}

      {step === 3 && (
        <Box>
          <Typography variant='h5' sx={{ mb: 3, textAlign: 'center', fontWeight: 'medium', color: 'text.primary' }}>
            {SIGNUP_TITLE}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label='First Name'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label='Last Name'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isSubscribed}
                onChange={(e) => setSubscribe(e.target.checked)}
              />
            }
            label={SIGNUP_CHECKBOX_LABEL}
            sx={{
              mb: 2,
              '& .MuiTypography-root': {
                fontSize: '0.875rem',
                color: 'text.secondary',
              },
            }}
          />

          <TextField
            fullWidth
            label='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            sx={{ mb: 3 }}
          />

          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            By signing up you agree to Aurelia Valencourt's{' '}
            <MuiLink component={Link} href="/terms-of-service" underline="hover" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </MuiLink>{' '}
            and{' '}
            <MuiLink component={Link} href="/privacy" underline="hover" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </MuiLink>.
          </Typography>

          {errors.form && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errors.form}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: step === 3 ? 'flex-end' : 'space-between', mt: 4 }}>
        {step < 3 && (
          <Button variant='contained' onClick={handleSkip} sx={{ color: 'primary.main', backgroundColor: 'background.paper' }}>
            Skip
          </Button>
        )}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {step > 1 && (
            <Button variant='contained' onClick={handleBack} sx={{ color: 'background.main', borderColor: 'primary.main' }}>
              Back
            </Button>
          )}
          <Button
            variant='contained'
            onClick={handleNext}
            disabled={(step === 1 && selectedIngredients.length === 0) || (step === 2 && selectedFlavorProfiles.length === 0)}
            sx={{ backgroundColor: 'primary.main' }}
          >
            {step === 3 ? 'Sign up' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SignupPreferences;
