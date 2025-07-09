import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Masonry } from '@mui/lab';
import { gql, useQuery } from '@apollo/client';
import CocktailCard, { CocktailCardFields } from '../CocktailCard';
import { getUserIdFromToken, generateCocktailUrl } from '../../utilities';
import debounce from 'lodash.debounce';

const ALL_USER_LIKES_COCKTAILS = gql`
  query allUserLikesCocktails($userId: UUID!, $orderBy: [UserLikesCocktailsOrderBy!] = [LIKED_AT_DESC], $first: Int, $after: Cursor) {
    userByUserId(userId: $userId) {
      userLikesCocktailsByUserId(orderBy: $orderBy, first: $first, after: $after) {
        edges {
          node {
            nodeId
            cocktailByCocktailId {
              ...CocktailCardFields
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
  ${CocktailCardFields}
`;

const FavoriteCocktailList = () => {
  const router = useRouter();
  const userId = getUserIdFromToken();

  const { data, loading, error, fetchMore } = useQuery(ALL_USER_LIKES_COCKTAILS, {
    variables: {
      userId,
      orderBy: ['LIKED_AT_DESC'],
      first: 10,
    },
    notifyOnNetworkStatusChange: true,
  });

  const allCocktails = data?.userByUserId?.userLikesCocktailsByUserId?.edges || [];
  const { endCursor, hasNextPage } = data?.userByUserId?.userLikesCocktailsByUserId?.pageInfo || {};

  const handleFetchMore = useCallback(() => {
    if (hasNextPage && !loading) {
      fetchMore({
        variables: {
          after: endCursor,
          first: 10,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          const previousEdges = previousResult?.userByUserId?.userLikesCocktailsByUserId?.edges || [];
          const newEdges = fetchMoreResult?.userByUserId?.userLikesCocktailsByUserId?.edges || [];
          const newPageInfo = fetchMoreResult?.userByUserId?.userLikesCocktailsByUserId?.pageInfo || {};

          return {
            ...previousResult,
            userByUserId: {
              ...previousResult.userByUserId,
              userLikesCocktailsByUserId: {
                ...previousResult.userByUserId?.userLikesCocktailsByUserId,
                edges: [...previousEdges, ...newEdges],
                pageInfo: newPageInfo,
              },
            },
          };
        },
      });
    }
  }, [hasNextPage, loading, fetchMore, endCursor]);

  const handleScroll = useCallback(
    debounce(() => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        handleFetchMore();
      }
    }, 300), // debounce time in ms
    [handleFetchMore]
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <Box sx={{ p: 2, minHeight: '100vh' }}>
      {loading && allCocktails.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
          Error loading cocktails.
        </Typography>
      )}
      {!loading && !error && allCocktails.length > 0 ? (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
            Collection
          </Typography>
          <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
            {allCocktails.map(({ node }) => (
              <CocktailCard
                key={node.cocktailByCocktailId.nodeId}
                cocktail={node.cocktailByCocktailId}
              />
            ))}
          </Masonry>
        </Box>
      ) : (
        !loading && !error && (
          <Typography textAlign="center" sx={{ mt: 4 }}>
            Your collection is empty.
          </Typography>
        )
      )}
      {loading && allCocktails.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default FavoriteCocktailList;
