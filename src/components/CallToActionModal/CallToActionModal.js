import React, { createContext, useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Modal, Box, Typography, Button } from '@mui/material';
import { setDidClickCtaLink } from '../../store/reducers/callToActionSlice';
const placeholderImage = '/assets/messenger.png';

const CallToActionModalContext = createContext();

export const useCallToActionModal = () => useContext(CallToActionModalContext);

export const CallToActionModalProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [isCallToActionOpen, setIsCallToActionOpen] = useState(false);

  const openCallToActionModal = () => {
    setIsCallToActionOpen(true);
  };

  const closeCallToActionModal = () => {
    setIsCallToActionOpen(false);
  };

  const handleVisitLink = () => {
    dispatch(setDidClickCtaLink(true));
    closeCallToActionModal();
    window.open('https://m.me/aureliavalencourt', '_blank');
  };

  return (
    <CallToActionModalContext.Provider value={{ openCallToActionModal, closeCallToActionModal }}>
      {children}

      <Modal
        open={isCallToActionOpen}
        onClose={closeCallToActionModal}
        aria-labelledby="chatbot-modal-title"
        aria-describedby="chatbot-modal-description"
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
          <Typography variant="h6" id="chatbot-modal-title" sx={{ mb: 2 }}>
            Always ready with the perfect pour
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleVisitLink}
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
                src={placeholderImage} // <- place the Messenger logo in your public folder
                alt="Messenger"
                style={{ width: 20, height: 20 }}
              />
            }
            >
            Chat on Messenger
            </Button>
          </Box>
        </Box>
      </Modal>
    </CallToActionModalContext.Provider>
  );
};

export default CallToActionModalProvider;
