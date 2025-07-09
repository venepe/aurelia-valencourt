import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { styled, keyframes } from '@mui/system';
import Box from '@mui/material/Box';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { useVoiceModal } from '../VoiceModal';

const hiddenRoutes = [
  '/login',
  '/signup',
  '/account',
  '/privacy',
  '/forgot-password',
  '/reset-password',
  '/terms-of-service',
];

const idleAnimation = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.9); /* Shrink slightly to indicate inactivity */
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

// Styled Component for the Lip
const StyledLip = styled(Box)(({ isVisible }) => ({
  position: 'fixed',
  bottom: isVisible ? '0' : '-80px', // Slide out of view when hidden
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: '560px', // Same max width as VoiceModalProvider
  height: '60px', // Adjusted height for better proportions
  backgroundColor: 'rgba(0, 0, 0, 0.7)', // Static color (replace with desired value)
  borderRadius: '400px 400px 0 0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0px -2px 10px rgba(0,0,0,0.2)',
  cursor: 'pointer',
  zIndex: 1300, // Above most content
  transition: 'bottom 0.3s ease-in-out', // Smooth animation for showing/hiding
}));

const LipIcon = styled(GraphicEqIcon)({
  color: '#ffffff', // Static color (replace with desired value)
  fontSize: '24px',
  animation: `${idleAnimation} 3s infinite ease-in-out`, // Slower, more passive animation
});

// LipButton Component
const LipButton = () => {
  const { pathname } = useRouter();
  const { openVoiceModal, isVoiceModalOpen, isCaptionOverlayOpen } = useVoiceModal(); // Access modal context
  const [isVisible, setIsVisible] = useState(true); // State to control visibility
  const [lastScrollPos, setLastScrollPos] = useState(0); // Keep track of scroll position

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;

      // Mobile Safari can scroll slightly beyond the top; handle that.
      const atTop = currentScrollPos <= 0;

      if (atTop) {
        // Always show the button when at the top of the page
        setIsVisible(true);
      } else if (currentScrollPos > lastScrollPos) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      // Update last scroll position
      setLastScrollPos(currentScrollPos);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollPos]);

  // Check if the current route is hidden
  const isHidden = hiddenRoutes.includes(pathname);

  // Don't render the button if the route is hidden, etc
  if (isHidden || isVoiceModalOpen || isCaptionOverlayOpen) {
    return null;
  }

  return (
    <StyledLip isVisible={isVisible} onClick={openVoiceModal}>
      <LipIcon />
    </StyledLip>
  );
};

export default LipButton;
