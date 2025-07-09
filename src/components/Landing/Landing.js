import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import { Box, Link, Chip, Typography, Button, CircularProgress, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Masonry } from '@mui/lab';
import { useRouter } from 'next/router';
import debounce from 'lodash.debounce';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery } from '../../store/reducers/searchSlice';
import CocktailCard, { CocktailCardFields } from '../CocktailCard';
import NoResults from '../NoResults';
import CocktailCardSkeleton from '../CocktailCardSkeleton';
import TrendingCocktails from '../TrendingCocktails';
import SearchTags from './SearchTags';
import TextCarousel from './TextCarousel';
import { getUserIdFromToken, generateProfileUrl } from '../../utilities';
import useDetectMobile from '../../hooks/useDetectMobile';
import { useVoiceModal } from '../VoiceModal';

const FIRST = 10;

const SEARCH_COCKTAILS = gql`
  query SearchCocktail($searchText: String!, $tagList: [String!], $first: Int, $after: Cursor) {
    searchCocktailAndTag(searchText: $searchText, tagList: $tagList, first: $first, after: $after) {
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

const LandingPage = () => {
  const router = useRouter();
  const { query } = router;
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.search.query);
  const [selectedTags, setSelectedTags] = useState(query.tags ? query.tags.split(',') : []);
  const { openVoiceModal, isVoiceModalOpen } = useVoiceModal(); // Access modal context
  const [searchActive, setSearchActive] = useState(true);
  const isMobile = useDetectMobile();

  useEffect(() => {
    const { query } = router.query;
    if (query !== searchQuery) {
      dispatch(setSearchQuery(query || ''));
    }
    setSearchActive((query && query.length > 0) || (selectedTags && selectedTags.length > 0));
  }, [router.query, searchQuery, selectedTags, dispatch]);

  const [searchCocktailAndTags, { data: searchData, loading: searchLoading, fetchMore }] = useLazyQuery(SEARCH_COCKTAILS, {
    variables: { searchText: searchQuery, tagList: selectedTags, first: FIRST },
    skip: !searchActive,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: "cache-first",
  });

  useEffect(() => {
    if (selectedTags !== query.tags) {
      setSelectedTags(query.tags ? query.tags.split(',') : []);
    }
  }, [query.tags]);

  useEffect(() => {
    if (searchActive && (searchQuery.length > 0 || selectedTags.length > 0)) {
      searchCocktailAndTags({
        variables: { searchText: searchQuery, tagList: selectedTags, first: FIRST }
      });
    }
  }, [searchActive, searchQuery, selectedTags, searchCocktailAndTags]);

  const handleTagClick = (tags) => {
    setSelectedTags(tags);
  };

  const handleScroll = useCallback(
    debounce(() => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
        && searchData?.searchCocktailAndTag?.pageInfo?.hasNextPage && searchData?.searchCocktailAndTag?.edges.length > FIRST - 1) {
        fetchMore({
          variables: { after: searchData.searchCocktailAndTag.pageInfo.endCursor, first: FIRST },
          updateQuery: (prev, { fetchMoreResult }) =>
            fetchMoreResult ? {
              searchCocktailAndTag: {
                ...fetchMoreResult.searchCocktailAndTag,
                edges: [...prev.searchCocktailAndTag.edges, ...fetchMoreResult.searchCocktailAndTag.edges],
              },
            } : prev,
        });
      }
    }, 300),
    [searchData, fetchMore]
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const cocktails = useMemo(() => searchActive ? searchData?.searchCocktailAndTag : null, [searchActive, searchData]);

  return (
    <Box sx={{ p: 2, pt: 4, minHeight: '100vh', textAlign: 'center' }}>
      {/* Trending Tags */}
      <SearchTags onActiveTagsChange={handleTagClick} searchText={searchQuery} />

      {/* Trending Cocktails */}
      {!searchLoading && !searchActive && (
        <Box sx={{ mt: 1 }}>
          <TrendingCocktails />
        </Box>
      )}

      {/* Search Results */}
        {searchLoading &&
          <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
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
          </Masonry>
        }
        {!searchLoading && searchActive && cocktails?.edges?.length > 0 && (
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
            {cocktails.edges.map(({ node: cocktail }) => (
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
            ))}
            {searchData?.searchCocktailAndTag.pageInfo.hasNextPage && (
              <IconButton
                aria-label={'More'}
                onClick={() => {
                  fetchMore({
                    variables: {
                      after: searchData.searchCocktailAndTag.pageInfo.endCursor,
                      first: COCKTAIL_FIRST,
                    },
                    updateQuery: (previousResult, { fetchMoreResult }) => {
                      if (!fetchMoreResult) return previousResult;

                      return {
                        ...fetchMoreResult,
                        searchCocktailAndTag: {
                          ...fetchMoreResult.searchCocktailAndTag,
                          edges: [
                            ...previousResult.searchCocktailAndTag.edges,
                            ...fetchMoreResult.searchCocktailAndTag.edges,
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
                <CircularProgress aria-label={'Loading'} fontSize="large" />
              </IconButton>
            )}
          </Box>
        ) : (
          <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
            {cocktails.edges.map(({ node: cocktail }) => (
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
            ))}
          </Masonry>
        )
      )}
      {!searchLoading && searchActive && cocktails?.edges?.length === 0 && <NoResults />}
    </Box>
  );
};

export default LandingPage;
