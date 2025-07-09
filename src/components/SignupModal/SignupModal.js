import React, { createContext, useContext, useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/router'; // Use Next.js router for navigation
import R from '../../resources';

const SignupModalContext = createContext();

export const useSignupModal = () => useContext(SignupModalContext);

export const SignupModalProvider = ({ children }) => {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [previousLocation, setPreviousLocation] = useState(null);
  const router = useRouter(); // Initialize Next.js router

  const openSignupModal = () => {
    setPreviousLocation(router.asPath);  // Capture the current location
    setIsSignupOpen(true);
  };

  const closeSignupModal = () => setIsSignupOpen(false);

  const handleNavigation = (path) => {
    closeSignupModal();
    sessionStorage.setItem(path, JSON.stringify({ x: 0, y: 0 }));
    router.push(path, undefined, { shallow: true }); // Navigate to the new path
  };

  return (
    <SignupModalContext.Provider value={{ openSignupModal, closeSignupModal, previousLocation }}>
      {children}

      <Modal
        open={isSignupOpen}
        onClose={closeSignupModal}
        aria-labelledby="signup-modal-title"
        aria-describedby="signup-modal-description"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '500px',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: '16px 16px 0 0',
            textAlign: 'center',
            outline: 'none',
          }}
        >
          <Typography variant="h6" id="signup-modal-title" sx={{ mb: 2 }}>
            {R.strings.APP_SLOGAN}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleNavigation('/login')}  // Navigate to login
            >
              Let's get started
            </Button>
          </Box>
        </Box>
      </Modal>
    </SignupModalContext.Provider>
  );
};

export default SignupModalProvider;
