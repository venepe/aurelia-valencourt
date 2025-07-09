import React from 'react';
import { useSelector } from 'react-redux';
import SkeletonImageLoader from './SkeletonImageLoader';
import useImage from '../../hooks/useImage';
import { getOptimizedImageUrl } from '../../utilities';

const CocktailDetailImage = ({ imageUrl, anecdoteText }) => {
  const isWebPSupported = useSelector((state) => state.webp.isSupported);
  const optimizedImageUrl = getOptimizedImageUrl(imageUrl, isWebPSupported);
  const loaded = useImage(optimizedImageUrl);

  return loaded ? (
    <img
      src={optimizedImageUrl}
      alt={anecdoteText || 'Cocktail Image'}
      style={{
        maxWidth: "100%",
        height: "auto",
        objectFit: "contain",
        borderRadius: 1,
        marginBottom: "16px",
        transition: "opacity 0.3s ease-in-out",
      }}
    />
  ) : (
    <SkeletonImageLoader />
  );
};

export default CocktailDetailImage;
