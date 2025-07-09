import { useState, useEffect } from 'react';

const useImage = (src) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    if (img.complete) {
      setLoaded(true); // Immediately set as loaded if cached
    } else {
      img.onload = () => setLoaded(true);
    }
  }, [src]);

  return loaded;
};

export default useImage;
