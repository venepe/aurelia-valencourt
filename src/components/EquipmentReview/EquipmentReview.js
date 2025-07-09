import React, { useCallback, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, CardMedia, Typography, Rating, Button, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import debounce from 'lodash.debounce';
import { useSignupModal } from '../SignupModal';
import EquipmentReviewSkeleton from './EquipmentReviewSkeleton';
const FIRST = 3;

const GET_EQUIPMENT_BY_ID = gql`
  query EquipmentByEquipmentId($equipmentId: UUID!) {
    equipmentByEquipmentId(equipmentId: $equipmentId) {
      nodeId
      equipmentId
      name
      description
      imageUrl
      equipmentCriteriaByEquipmentId(orderBy: [POSITION_ASC]) {
        nodes {
          nodeId
          criteriaId
          title
          description
          position
        }
      }
      equipmentReviewsByEquipmentId {
        totalCount
        nodes {
          nodeId
          productName
          reviewText
          rating
          affiliateLinksByReviewId {
            nodes {
              nodeId
              affiliateUrl
              platformName
              linkDescription
            }
          }
        }
      }
    }
  }
`;

const RECOMMENDED_EQUIPMENT = gql`
query RecommendedEquipment($pEquipmentId: UUID!, $first: Int!, $after: Cursor) {
  recommendedEquipment(pEquipmentId: $pEquipmentId, first: $first, after: $after) {
    edges {
      node {
        nodeId
        equipmentId
        name
        description
        imageUrl
      }
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
    }
  }
}
`;

const HeaderImage = styled('div')(({ theme, imageUrl }) => ({
  width: '100%', // Makes the image responsive
  maxWidth: '1200px', // Restricts the maximum width to 1200px
  height: 'auto', // Ensures the height scales proportionally
  backgroundImage: `url(${imageUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  aspectRatio: '2 / 1', // Ensures a consistent 2:1 aspect ratio
  margin: '0 auto', // Centers the image horizontally
  [theme.breakpoints.down('sm')]: {
    aspectRatio: '2 / 1', // Adjust aspect ratio for smaller screens
    backgroundPosition: 'center',
  },
}));

const EquipmentReview = ({ id }) => {
  const theme = useTheme();

  const { data, loading, error } = useQuery(GET_EQUIPMENT_BY_ID, {
    variables: { equipmentId: id },
    skip: !id,
  });

  if (loading) return <EquipmentReviewSkeleton />;
  if (error) return <Typography>Error loading equipment data.</Typography>;

  const equipment = data?.equipmentByEquipmentId;
  const criteria = equipment?.equipmentCriteriaByEquipmentId.nodes || [];
  const reviews = equipment?.equipmentReviewsByEquipmentId.nodes || [];
  const totalCount = equipment?.equipmentReviewsByEquipmentId.totalCount || '';
  const imageUrl = equipment?.imageUrl;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: { sm: '100%', md: '1200px' },
        mx: { sm: 0, md: 'auto' },
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        mb: 6,
        borderRadius: 2, // Rounded corners for a modern look
        overflow: 'hidden', // Ensures no content spills out
      }}
    >
  {/* Header Image */}
  <HeaderImage imageUrl={imageUrl} />

  {/* Equipment Details */}
  <Box
    sx={{
      padding: 3,
      maxWidth: '800px',
      mx: { sm: 0, md: 'auto', lg: 30 },
    }}
    >
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
        The {equipment?.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {equipment?.description}
      </Typography>

      {/* Equipment Criteria */}
      {criteria.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
            How to Select the Perfect {equipment?.name}
          </Typography>
          {criteria.map((criterion) => (
            <Box
              key={criterion.nodeId}
              sx={{
                mb: 3,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                padding: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1, // Rounded edges for cards
                backgroundColor: '#fff',
              }}
            >
              <Typography
                variant="body1"
                component="p"
                sx={{
                  fontWeight: 'bold',
                  minWidth: '30px',
                  textAlign: 'right',
                }}
              >
                {criterion.position}.
              </Typography>
              <Box>
                <Typography variant="subtitle1" component="p" sx={{ fontWeight: 600, mb: 1 }}>
                  {criterion.title}
                </Typography>
                <Typography variant="body2" component="p" color="text.secondary" sx={{ maxWidth: 600 }}>
                  {criterion.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Show Editorial Disclaimer only if there are reviews */}
      {reviews.length > 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: 'italic', mb: 2, textAlign: 'center' }}
        >
          At Aurelia Valencourt, we meticulously curate and review each product featured in our Suggestions to ensure they meet our high standards of sophistication and quality. Occasionally, we may earn a commission through carefully selected affiliate links. Rest assured, our editorial integrity and dedication to timeless elegance remain uncompromised.
        </Typography>
      )}
    </Box>
    {/* Reviews Section */}
    {reviews.length > 0 && (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 4, mb: 2 }}>
          <Typography component="h2" variant="h5" sx={{ fontWeight: 'bold' }}>
            Suggestions
          </Typography>
          <Typography
            component="p"
            variant="body2"
            sx={{ color: 'text.disabled', ml: 1, alignSelf: 'center' }}
          >
            {totalCount}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2, // Adjust spacing between review cards
            pb: 2, // Optional: Padding at the bottom to ensure content doesn't cut off
            ml: 1,
          }}
        >
          {reviews.map((review) => (
            <Box
              key={review.nodeId}
              sx={{
                flexShrink: 0, // Prevent shrinking of review cards
                minWidth: { xs: 'calc(100vw - 80px)', sm: 300 }, // Full window width minus padding on xs
                maxWidth: { xs: 'calc(100vw - 80px)', sm: 500 }, // Full window width minus padding on xs
                mb: 6,
                padding: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: '#fff',
                mx: { sm: 0, md: 2 },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  gap: 1,
                }}
              >
                <Typography component="p" variant="h6" sx={{ fontWeight: 600 }}>
                  {review.productName}
                </Typography>
                <Rating value={review.rating} readOnly precision={0.5} sx={{ fontSize: '1rem' }} />
              </Box>
              <Typography component="p" variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {review.reviewText}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                {review.affiliateLinksByReviewId.nodes.map((link) => (
                  <Link key={link.nodeId} href={link.affiliateUrl} passHref target="_blank" rel="noopener noreferrer">
                    <Button
                      color="primary"
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        px: 2, // Extra padding for better button size
                      }}
                    >
                      {link.platformName} - {link.linkDescription}
                    </Button>
                  </Link>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </>
    )}
  </Box>
  );
};

const EquipmentReviewPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { openSignupModal } = useSignupModal();

  const { data, fetchMore, loading } = useQuery(RECOMMENDED_EQUIPMENT, {
    variables: { pEquipmentId: id, first: FIRST }, // Fetch a batch of 3 cocktails
  });

  const handleScroll = useCallback(
    debounce(() => {
      if (!isAuthenticated && window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        openSignupModal();
      }

      if (!data?.recommendedEquipment.pageInfo.hasNextPage) return;

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        fetchMore({
          variables: { first: FIRST, after: data.recommendedEquipment.pageInfo.endCursor }, // No cursor in state, use data directly
          updateQuery: (previousResult, { fetchMoreResult }) => {
            if (!fetchMoreResult) return previousResult;

            return {
              recommendedEquipment: {
                ...fetchMoreResult.recommendedEquipment,
                edges: [
                  ...previousResult.recommendedEquipment.edges,
                  ...fetchMoreResult.recommendedEquipment.edges,
                ],
              },
            };
          },
        });
      }
    }, 300),
    [data, fetchMore, isAuthenticated, openSignupModal]
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <Box>
      <EquipmentReview id={id} />

      <Box sx={{ mt: 10 }}>
        {data?.recommendedEquipment.edges.map((recommended) => (
          <EquipmentReview key={recommended.node.equipmentId} id={recommended.node.equipmentId} />
        ))}
        {loading && <CircularProgress />}
      </Box>

    </Box>
  );
};

export default EquipmentReviewPage;
