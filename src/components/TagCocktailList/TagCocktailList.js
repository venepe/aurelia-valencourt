import React, { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Masonry } from '@mui/lab';
import { gql, useQuery } from '@apollo/client';
import debounce from 'lodash.debounce';
import { useSelector } from 'react-redux';
import CocktailCard, { CocktailCardFields } from '../CocktailCard';
import TagCocktailListSkeleton from './TagCocktailListSkeleton';
import { useCallToActionModal } from '../CallToActionModal';
import useDetectMobile from '../../hooks/useDetectMobile';
import { toTitleCase } from '../../utilities';

const ALL_COCKTAILS_BY_TAG_ID = gql`
  query AllCocktailsByTagId($tagId: UUID!, $first: Int, $after: Cursor) {
    allTags(condition: { tagId: $tagId }) {
      edges {
        node {
          nodeId
          tagId
          tagName
          description
          imageUrl
          cocktailTagsByTagId(orderBy: [COCKTAIL_BY_COCKTAIL_ID__COCKTAIL_ORDER_ASC], first: $first, after: $after) {
            edges {
              node {
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
    }
  }
  ${CocktailCardFields}
`;

const TagCocktailList = () => {
  const router = useRouter();
  const tagId = useMemo(() => router.query.id, [router.query.id]);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const didClickCtaLink = useSelector((state) => state.callToAction.didClickCtaLink);
  const { openCallToActionModal } = useCallToActionModal();
  const isMobile = useDetectMobile();

  const { data, loading, error, fetchMore } = useQuery(ALL_COCKTAILS_BY_TAG_ID, {
    variables: { tagId, first: 10 },
    skip: !tagId,
    notifyOnNetworkStatusChange: true,
  });

  const allCocktails = data?.allTags?.edges?.[0]?.node?.cocktailTagsByTagId?.edges || [];
  const { endCursor, hasNextPage } = data?.allTags?.edges?.[0]?.node?.cocktailTagsByTagId?.pageInfo || {};
  const tagOrCocktail = data?.allTags?.edges?.[0]?.node;

  const handleFetchMore = useCallback(() => {
    if (hasNextPage) {
      fetchMore({
        variables: {
          after: endCursor,
          first: 10,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult; // If no more results, return the existing data

          return {
            ...fetchMoreResult, // Keep any new data
            allTags: {
              ...fetchMoreResult.allTags,
              edges: previousResult.allTags.edges.map((tagEdge, index) => {
                // Ensure we merge cocktails for the correct tag
                if (index === 0) {
                  return {
                    ...tagEdge,
                    node: {
                      ...tagEdge.node,
                      cocktailTagsByTagId: {
                        ...tagEdge.node.cocktailTagsByTagId,
                        edges: [
                          ...tagEdge.node.cocktailTagsByTagId.edges, // Existing cocktails
                          ...fetchMoreResult.allTags.edges[0].node.cocktailTagsByTagId.edges, // New cocktails
                        ],
                        pageInfo: fetchMoreResult.allTags.edges[0].node.cocktailTagsByTagId.pageInfo, // Update pagination info
                      },
                    },
                  };
                }
                return tagEdge;
              }),
            },
          };
        },
      });
    }
  }, [hasNextPage, endCursor, fetchMore]);

  const handleScroll = useCallback(
    debounce(() => {
      if (!isAuthenticated && !didClickCtaLink && window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        openCallToActionModal();
      }
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        if (hasNextPage && !loading) {
          handleFetchMore();
        }
      }
    }, 300),
    [handleFetchMore, hasNextPage, loading, isAuthenticated, openCallToActionModal]
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  if (loading && allCocktails.length === 0) {
    return (<TagCocktailListSkeleton />);
  }

  return (
    <Box sx={{ p: 2, minHeight: '100vh' }}>
      {tagOrCocktail?.imageUrl && (
        <Box
          sx={{
            width: '100%',
            height: 420,
            backgroundImage: `url(${tagOrCocktail.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 3,
            boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.12)',
            mb: 3,
          }}
        />
      )}
      {tagOrCocktail?.tagName && (
        <Typography
          component="h1"
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: '#1E1E1E',
            mb: 1,
            textAlign: 'center',
            letterSpacing: '0.5px',
          }}
        >
          {toTitleCase(tagOrCocktail.tagName)}
        </Typography>
      )}
      {tagOrCocktail?.description && (
        <Typography
          component="p"
          variant="body1"
          sx={{
            textAlign: 'center',
            color: 'rgba(0, 0, 0, 0.7)',
            maxWidth: '60ch',
            mx: 'auto',
            mb: 4,
          }}
        >
          {tagOrCocktail.description || 'Explore a curated list of cocktails perfect for any occasion.'}
        </Typography>
      )}
      {error && (
        <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
          Error loading cocktails.
        </Typography>
      )}
      {allCocktails.length > 0 ? (
        isMobile ? (
          <Box
            sx={{
              display: 'flex',
              pl: 1,
              flexDirection: 'column',
              overflowX: 'visible',
              overflowY: 'auto',
              whiteSpace: 'normal',
              scrollbarWidth: 'thin',
              gap: 2,
              height: '100%',
            }}
          >
            {allCocktails.map(({ node }) => (
              <Box
                key={node.cocktailByCocktailId.nodeId}
                sx={{ maxWidth: '416px', flexShrink: 0, mb: { xs: 2, sm: 2 } }}
              >
                <CocktailCard cocktail={node.cocktailByCocktailId} />
              </Box>
            ))}
          </Box>
        ) : (
          <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
            {allCocktails.map(({ node }) => (
              <Box
                key={node.cocktailByCocktailId.nodeId}
                sx={{ maxWidth: '416px', flexShrink: 0, mb: { xs: 2, sm: 2 } }}
              >
                <CocktailCard cocktail={node.cocktailByCocktailId} />
              </Box>
            ))}
          </Masonry>
        )
      ) : (
        !loading && !error && (
          <Typography textAlign="center" sx={{ mt: 4 }}>
            No cocktails available.
          </Typography>
        )
      )}
    </Box>
  );
};

export default TagCocktailList;
