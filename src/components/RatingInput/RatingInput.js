import React, { useState } from 'react';
import { Box, Rating } from '@mui/material';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import { useSignupModal } from '../SignupModal';
import { getUserIdFromToken } from '../../utilities';

function calculateNewAverage(currentAverage, currentCount, newValue) {
  // Calculate the new average
  const newAverage = ((currentAverage * currentCount) + newValue) / (currentCount + 1);
  return newAverage;
}

function updateAverage(currentAverage, currentCount, oldValue, newValue) {
  // Calculate the new average
  const newAverage = (currentAverage * currentCount - oldValue + newValue) / currentCount;
  return newAverage;
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

const RatingInput = ({ cocktailId, sx }) => {
  const userId = getUserIdFromToken();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { openSignupModal } = useSignupModal();

  // Fetch user's existing rating for the cocktail
  const { data, loading } = useQuery(USER_RATING_FOR_COCKTAIL, {
    variables: { userId, cocktailId },
    skip: !isAuthenticated, // Skip if user is not authenticated
  });

  const userRating = data?.cocktailRatingByUserIdAndCocktailId?.rating || 0;
  const nodeId = data?.cocktailRatingByUserIdAndCocktailId?.nodeId || null;

  // Mutations for creating and updating the rating
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
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  return (
    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', ...sx }}>
      <Rating
        value={userRating}
        onChange={(event, newValue) => handleRatingChange(newValue)}
        precision={0.5}
        size="large"
        disabled={loading} // Disable while loading
      />
    </Box>
  );
};

export default RatingInput;
