import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CaptionOverlay = ({ isOpen, caption, onClose }) => {
  if (!isOpen || !caption) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        p: 3,
        textAlign: 'center',
        borderRadius: '16px 16px 0 0',
        maxWidth: '500px',
        margin: '0 auto',
        boxShadow: 24,
        zIndex: 1300, // Ensure it's above other content
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: '#ddd',
          fontStyle: 'italic',
          fontWeight: 600,
          flex: 1,
          marginTop: 1,
        }}
      >
        {caption}
      </Typography>
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 2,
          right: 2,
          color: 'rgba(255, 255, 255, 0.6)', // Slightly darker color for subtlety
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default CaptionOverlay;
