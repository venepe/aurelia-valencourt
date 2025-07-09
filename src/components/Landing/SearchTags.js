import React, { useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Box, Chip, Skeleton } from '@mui/material';
import { useRouter } from 'next/router';

const TRENDING_TAGS = gql`
  query GetRelevantTags($tagList: [String!], $searchText: String) {
    getRelevantTags(tagNames: $tagList, searchText: $searchText, first: 100) {
      edges {
        node {
          tagId
          tagName
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

const CocktailTags = ({ onActiveTagsChange, searchText }) => {
  const router = useRouter();
  const { query } = router;
  const [activeTags, setActiveTags] = useState(query.tags ? query.tags.split(',') : []);

  useEffect(() => {
    if (query.tags) {
      setActiveTags(query.tags.split(','));
    } else {
      setActiveTags([]);
    }
  }, [query.tags]);

  const { data: tagsData, loading } = useQuery(TRENDING_TAGS, {
    variables: { tagList: activeTags, searchText },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: "cache-first",
  });

  const handleTagClick = (tagName) => {
    const updatedTags = activeTags.includes(tagName)
      ? activeTags.filter((tag) => tag !== tagName)
      : [...activeTags, tagName];

    setActiveTags(updatedTags);

    onActiveTagsChange(updatedTags);

    router.push(
      {
        pathname: '/',
        query: { ...query, tags: updatedTags.length > 0 ? updatedTags.join(',') : undefined },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: { xs: 'flex-start', md: 'center' }, // Left-aligned on xs, centered on md+
        width: '100%', // Ensures full-width behavior
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 2,
          maxWidth: { md: '800px' }, // Limits width on md+
          width: '100%', // Ensures full-width on smaller screens
          whiteSpace: 'nowrap', // Prevents wrapping
        }}
      >
        {loading
          ? [...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rounded" width={60} height={32} />
            ))
          : tagsData?.getRelevantTags.edges.map(({ node: { tagId, tagName } }) => (
              <Chip
                key={tagName}
                label={tagName}
                clickable
                variant={activeTags.includes(tagName) ? 'filled' : 'outlined'}
                onClick={() => handleTagClick(tagName)}
                sx={{ fontSize: '14px' }}
              />
            ))}
      </Box>
    </Box>
  );
};

export default CocktailTags;
