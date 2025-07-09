import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Box, CircularProgress, Link, Typography, useMediaQuery, IconButton } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import debounce from 'lodash.debounce';
import CocktailCard, { CocktailCardFields } from '../CocktailCard';
import CocktailCardSkeleton from '../CocktailCardSkeleton';
import NoResults from '../NoResults';

const COCKTAIL_FIRST = 8;

const TRENDING_COCKTAILS = gql`
  query TrendingCocktails($first: Int, $after: Cursor) {
    trendingCocktails(first: $first, after: $after) {
      edges {
        node {
          ...CocktailCardFields
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
  ${CocktailCardFields}
`;

const TrendingCocktails = () => {
  const { data, loading, error, fetchMore } = useQuery(TRENDING_COCKTAILS, {
    variables: { first: COCKTAIL_FIRST },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: "cache-first",
  });

  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm')); // Check screen size
  const scrollContainerRef = useRef(null); // Create a ref for the scroll container
  const [scrolling, setScrolling] = useState(false); // To prevent multiple scrolls at once

  const handleScroll = useCallback(
    debounce(() => {
      if (isSmallScreen) {
        // Vertical scroll for small screens
        if (
          window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 100 &&
          data?.trendingCocktails.pageInfo.hasNextPage
        ) {
          fetchMore({
            variables: {
              after: data.trendingCocktails.pageInfo.endCursor,
              first: COCKTAIL_FIRST,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
              if (!fetchMoreResult) return previousResult;

              return {
                ...fetchMoreResult,
                trendingCocktails: {
                  ...fetchMoreResult.trendingCocktails,
                  edges: [
                    ...previousResult.trendingCocktails.edges,
                    ...fetchMoreResult.trendingCocktails.edges,
                  ],
                },
              };
            },
          });
        }
      } else {
        // Horizontal scroll for large screens
        const container = scrollContainerRef.current;
        if (
          container &&
          container.scrollLeft + container.clientWidth >=
            container.scrollWidth - 100 &&
          data?.trendingCocktails.pageInfo.hasNextPage
        ) {
          fetchMore({
            variables: {
              after: data.trendingCocktails.pageInfo.endCursor,
              first: COCKTAIL_FIRST,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
              if (!fetchMoreResult) return previousResult;

              return {
                ...fetchMoreResult,
                trendingCocktails: {
                  ...fetchMoreResult.trendingCocktails,
                  edges: [
                    ...previousResult.trendingCocktails.edges,
                    ...fetchMoreResult.trendingCocktails.edges,
                  ],
                },
              };
            },
          });
        }
      }
    }, 300),
  [isSmallScreen, data, fetchMore]);

  const scrollTo = (direction) => {
    if (scrolling) return; // Prevent multiple scrolls at the same time
    setScrolling(true);
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === 'right' ? 400 : -400;
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(() => setScrolling(false), 300); // Reset scrolling state after smooth scroll
    }
  };

  useEffect(() => {
    if (isSmallScreen) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
      }
    }
  }, [isSmallScreen, handleScroll]);

  const cocktails = useMemo(() => data?.trendingCocktails?.edges || [], [data]);

  if (error) return <NoResults message="Failed to load trending cocktails." />;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Outer wrapper for the scrollable content */}
      <Box
        ref={scrollContainerRef}
        sx={{
          display: 'flex',
          pl: 1,
          flexDirection: { xs: 'column', sm: 'row' },
          overflowX: { xs: 'visible', sm: 'auto' },
          overflowY: { xs: 'auto', sm: 'hidden' },
          whiteSpace: { xs: 'normal', sm: 'nowrap' },
          scrollbarWidth: 'thin',
          gap: 2,
          height: '100%', // Ensures that the container takes up the full height of the parent
        }}
      >
        {loading ? (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  maxWidth: '416px',
                  flexGrow: 1,
                  flexShrink: 0,
                  mb: { xs: 2, sm: 2 },
                }}
              >
                <CocktailCardSkeleton key={index} />
              </Box>
            ))}
          </>
        ) : (
          cocktails.map(({ node: cocktail }) => (
            <Box
              key={cocktail.cocktailId}
              sx={{
                maxWidth: '416px',
                flexShrink: 0,
                mb: { xs: 2, sm: 2 },
              }}
            >
              <CocktailCard cocktail={cocktail} />
            </Box>
          ))
        )}
        {data?.trendingCocktails.pageInfo.hasNextPage && (
          <IconButton
            aria-label={'More'}
            onClick={() => {
              fetchMore({
                variables: {
                  after: data.trendingCocktails.pageInfo.endCursor,
                  first: COCKTAIL_FIRST,
                },
                updateQuery: (previousResult, { fetchMoreResult }) => {
                  if (!fetchMoreResult) return previousResult;

                  return {
                    ...fetchMoreResult,
                    trendingCocktails: {
                      ...fetchMoreResult.trendingCocktails,
                      edges: [
                        ...previousResult.trendingCocktails.edges,
                        ...fetchMoreResult.trendingCocktails.edges,
                      ],
                    },
                  };
                },
              });
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: { xs: '100%', sm: '40px' },
            }}
          >
            {isSmallScreen ? <CircularProgress fontSize="large" /> : <NavigateNextIcon fontSize="large" />}
          </IconButton>
        )}
      </Box>

      {/* Scroll buttons for desktop */}
      {!isSmallScreen && (
        <>
          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional background for visibility
              color: 'white',
            }}
            aria-label={'Previous'}
            onClick={() => scrollTo('left')}
          >
            <NavigateBeforeIcon fontSize="large" />
          </IconButton>
          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional background for visibility
              color: 'white',
            }}
            aria-label={'Next'}
            onClick={() => scrollTo('right')}
          >
            <NavigateNextIcon fontSize="large" />
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default TrendingCocktails;
