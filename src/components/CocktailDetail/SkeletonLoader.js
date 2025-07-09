import React from 'react';
import { Box, Typography, Grid, Paper, IconButton, Skeleton, Chip } from '@mui/material';

const SkeletonLoader = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: { sm: '100%', md: '1200px' },
        mx: { sm: 0, md: 'auto' },
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        mb: 6,
        p: 2,
      }}
    >

      {/* Top Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          mb: 2,
          mt: { sm: 0, md: 1, lg: 2 },
        }}
      >
      <Box
        sx={{
          flex: { xs: '1', md: '0 0 45%' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: { xs: 1, md: 0 },
          ml: { xs: 0, md: 2 },
          paddingRight: { xs: 0, md: 1 },
        }}
        >
          {/* Carousel Placeholder */}
          <Skeleton
            variant="rectangular"
            sx={{
              flex: 1,
              flexGrow: 1,
              width: "100%",
              height: "100%",
              aspectRatio: "1 / 1", // Maintains square shape
            }}
          />
        </Box>
        <Box sx={{ flex: 1, p: 2, ml: { md: 5 }, display: 'flex', flexDirection: 'column' }}>
          {/* Title Section */}
          <Skeleton variant="text" width="70%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />

          {/* Rating Section */}
          <Box display="flex" alignItems="center" mt={0} mb={2}>
            <Skeleton variant="text" width={100} height={30} />
          </Box>

          {/* Tags Section */}
          <Box
            sx={{
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              gap: 1,
              mb: 2,
              maxWidth: 360,
              display: 'flex',
            }}
          >
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" width={80} height={30} sx={{ borderRadius: 2, mr: 1 }} />
            ))}
          </Box>

          {/* Description Placeholder */}
          <Skeleton variant="text" width="100%" height={30} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="90%" height={30} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={30} />
        </Box>
      </Box>

      {/* Ingredients Section */}
      <Box sx={{ mb: 2, pl: 2, pr: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 2 }}>
          <Skeleton variant="text" width={150} height={30} />
        </Typography>
        <Grid container spacing={1}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="text" width="90%" height={20} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Equipment Section */}
      <Box sx={{ mb: 2, pl: 2, pr: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 2 }}>
          <Skeleton variant="text" width={150} height={30} />
        </Typography>
        <Grid container spacing={1}>
          {[...Array(3)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" width="100%" height={50} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Instructions Section */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 4, mb: 2, pl: 2, pr: 2 }}>
        <Skeleton variant="text" width={200} height={30} />
      </Typography>
      {[...Array(3)].map((_, index) => (
        <Paper
          key={index}
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: '#f5f5f5',
          }}
        >
          <Skeleton variant="text" width="30%" height={25} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={20} />
        </Paper>
      ))}
    </Box>
  );
};

export default SkeletonLoader;
