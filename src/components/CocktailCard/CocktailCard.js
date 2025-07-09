import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { Box, Card, CardMedia, Typography, Rating } from '@mui/material';
import CocktailCardSkeleton from '../CocktailCardSkeleton';
import { CocktailQuestionsFirstFragment } from '../CocktailQuestions';
import FavoriteButton from '../FavoriteButton';
import useImage from '../../hooks/useImage';
import { generateCocktailUrl, getOptimizedImageUrl } from '../../utilities';

// Define the fragment for the cocktail
export const CocktailCardFields = gql`
  fragment CocktailCardFields on Cocktail {
    nodeId
    cocktailId
    title
    description
    rating
    ratingCount
    isNew
    cocktailImagesByCocktailId(orderBy: [IMAGE_ORDER_ASC]) {
      nodes {
        nodeId
        imageId
        imageUrl
      }
    }
  }
`;

const CocktailCard = ({ cocktail, handleCocktailNavigation }) => {
  const isWebPSupported = useSelector((state) => state.webp.isSupported);

  // Get the first imageUrl from the cocktailImagesByCocktailId field
  const imageUrl = cocktail.cocktailImagesByCocktailId.nodes[0]?.imageUrl;
  const optimizedImageUrl = getOptimizedImageUrl(imageUrl, isWebPSupported);
  const loaded = useImage(optimizedImageUrl);

  if (!loaded) {
    return (<CocktailCardSkeleton />);
  }

  return (
    <Link
      href={generateCocktailUrl(cocktail.cocktailId, cocktail.title)}
      passHref
      style={{ textDecoration: 'none' }} // Remove link style
    >
      <Card
        sx={{
          position: 'relative',
          boxShadow: 4,
          borderRadius: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: 8,
          },
          cursor: 'pointer',
          bgcolor: 'background.paper',
        }}
      >
        {cocktail.isNew && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'secondary.main',
              color: 'primary.contrastText',
              borderRadius: 1,
              paddingX: 1.5,
              paddingY: 0.5,
              fontSize: '0.75rem',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              zIndex: 1,
            }}
          >
            New
          </Box>
        )}
        <CardMedia
          component="img"
          image={optimizedImageUrl} // Local image as placeholder
          alt={cocktail.title}
          sx={{
            width: '100%',
            height: 'auto',
            objectFit: 'cover',
            transition: 'opacity 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
        {/* FavoriteButton positioned in the upper right */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: '#fff',
              borderRadius: '50%',
              padding: '4px',
            }}
          >
            <FavoriteButton color={'#F5F5F5'} cocktailId={cocktail.cocktailId} />
          </Box>
          {/* Title and Description */}
          <Box
      sx={{
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        bgcolor: 'background.default',
        width: '100%', // Ensure the box takes up the full available width
        overflow: 'hidden', // Optional: Prevents overflow beyond the box
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        sx={{
          fontWeight: 700,
          marginBottom: 1,
          marginRight: 2,
          color: 'text.primary',
          textAlign: 'left',
          fontSize: '1.25rem',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        {cocktail.title}
      </Typography>
      <Box display="flex" alignItems="center" mb={1}>
        <Rating value={cocktail.rating} readOnly precision={0.5} />
        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
          {parseFloat(cocktail.rating)?.toFixed(1)}
        </Typography>
        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
          {cocktail.ratingCount || 0} {cocktail.ratingCount === 1 ? 'rating' : 'ratings'}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          textAlign: 'left',
          marginRight: 3,
          whiteSpace: 'normal', // Ensures wrapping for the description
          wordBreak: 'break-word', // Handles long text breaking
        }}
      >
        {cocktail.description}
      </Typography>
    </Box>
  </Card>
</Link>
  );
};

export default CocktailCard;
