import { useState, useEffect } from 'react';

const MOBILE_SCREEN_SIZE = 600;

const useDetectMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_SCREEN_SIZE : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_SCREEN_SIZE);
    };

    const isMobileDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      return /android|iphone|ipod|windows phone|blackberry|mobile/i.test(userAgent);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

export default useDetectMobile;
