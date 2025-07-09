import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, Rating } from '@mui/material';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import { useSignupModal } from '../SignupModal';
import { getUserIdFromToken } from '../../utilities';

function calculateNewAverage(currentAverage, currentCount, newValue) {
  return ((currentAverage * currentCount) + newValue) / (currentCount + 1);
}

function updateAverage(currentAverage, currentCount, oldValue, newValue) {
  return (currentAverage * currentCount - oldValue + newValue) / currentCount;
}

const USER_RATING_FOR_COCKTAIL = gql`
  query UserRatingForCocktail($userId: UUID!, $cocktailId: UUID!) {
    cocktailRatingByUserIdAndCocktailId(userId: $userId, cocktailId: $cocktailId) {
      rating
      nodeId
      userId
      cocktailId
    }
  }
`;

const CREATE_USER_RATING_FOR_COCKTAIL = gql`
  mutation CreateCocktailRating($userId: UUID!, $cocktailId: UUID!, $rating: BigFloat!) {
    createCocktailRating(
      input: {
        cocktailRating: {
          userId: $userId,
          cocktailId: $cocktailId,
          rating: $rating
        }
      }
    ) {
      cocktailRating {
        nodeId
        userId
        cocktailId
        rating
      }
    }
  }
`;

const UPDATE_USER_RATING_FOR_COCKTAIL = gql`
  mutation UpdateCocktailRating($nodeId: ID!, $rating: BigFloat!) {
    updateCocktailRating(
      input: {
        nodeId: $nodeId,
        cocktailRatingPatch: { rating: $rating }
      }
    ) {
      cocktailRating {
        nodeId
        userId
        cocktailId
        rating
      }
    }
  }
`;

const RatingsModal = ({ open, onClose, cocktailId, cocktailTitle, onRatingUpdate }) => {
  const userId = getUserIdFromToken();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { openSignupModal } = useSignupModal();

  const { data, loading } = useQuery(USER_RATING_FOR_COCKTAIL, {
    variables: { userId, cocktailId },
    skip: !isAuthenticated, // Skip if user is not authenticated
  });

  const userRating = data?.cocktailRatingByUserIdAndCocktailId?.rating || 0;
  const nodeId = data?.cocktailRatingByUserIdAndCocktailId?.nodeId || null;

  const [createRating] = useMutation(CREATE_USER_RATING_FOR_COCKTAIL);
  const [updateRating] = useMutation(UPDATE_USER_RATING_FOR_COCKTAIL);

  const handleRatingChange = async (newRating) => {
    if (!isAuthenticated) {
      openSignupModal();
      return;
    }

    const currentRating = userRating;

    try {
      if (nodeId) {
        // Update existing rating
        await updateRating({
          variables: {
            nodeId,
            rating: newRating,
          },
          optimisticResponse: {
            updateCocktailRating: {
              cocktailRating: {
                nodeId,
                userId,
                cocktailId,
                rating: newRating,
                __typename: 'CocktailRating',
              },
            },
          },
          update: (cache) => {
            cache.modify({
              id: cache.identify({ __typename: 'Cocktail', cocktailId }),
              fields: {
                rating(existingRating = 0, { readField }) {
                  const ratingCount = readField('ratingCount') || 0;
                  const newAverage = updateAverage(existingRating, ratingCount, currentRating, newRating);
                  return newAverage;
                },
                ratingCount(existingCount = 0) {
                  return existingCount; // Keep the same count for updates
                },
              },
            });
          },
        });
      } else {
        // Create new rating
        const temporaryNodeId = `temp-${Date.now()}`;
        const { data } = await createRating({
          variables: {
            userId,
            cocktailId,
            rating: newRating,
          },
          optimisticResponse: {
            createCocktailRating: {
              cocktailRating: {
                userId,
                cocktailId,
                rating: newRating,
                nodeId: temporaryNodeId,
                __typename: 'CocktailRating',
              },
            },
          },
          update: (cache, { data }) => {
            cache.modify({
              id: cache.identify({ __typename: 'Cocktail', cocktailId }),
              fields: {
                rating(existingRating = 0, { readField }) {
                  const ratingCount = readField('ratingCount') || 0;
                  const newAverage = calculateNewAverage(existingRating, ratingCount, newRating);
                  return newAverage;
                },
                ratingCount(existingCount = 0) {
                  return existingCount + 1; // Increment the rating count for new ratings
                },
              },
            });

            if (data?.createCocktailRating) {
              const realNodeId = data.createCocktailRating.cocktailRating.nodeId;

              // Update the cache with the real nodeId
              cache.writeQuery({
                query: USER_RATING_FOR_COCKTAIL,
                data: {
                  cocktailRatingByUserIdAndCocktailId: {
                    ...data.createCocktailRating.cocktailRating, // Use the server response
                  },
                },
                variables: { userId, cocktailId },
              });
            }
          },
        });
      }
      if (onRatingUpdate) onRatingUpdate(newRating); // Notify parent component

      // Automatically close the modal
      onClose();
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="rating-modal-title"
      aria-describedby="rating-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxWidth: 400,
          width: '100%',
          outline: 'none',
        }}
      >
        <Typography id="rating-modal-title" variant="h6" component="h2" sx={{ mb: 2, textAlign: 'center' }}>
          Rate Your Experience
        </Typography>
        <Typography id="rating-modal-description" sx={{ mb: 2, textAlign: 'center' }}>
          How would you rate your experience with preparing the {cocktailTitle || 'cocktail'}?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Rating
            value={userRating}
            onChange={(event, newValue) => handleRatingChange(newValue)}
            precision={0.5}
            size="large"
            disabled={loading} // Disable while loading
          />
        </Box>
        <Box sx={{ mt: 3, mr: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RatingsModal;
