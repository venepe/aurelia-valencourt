import React from 'react';
import { Skeleton } from '@mui/material';

const SkeletonImageLoader = () => {
  return (
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
  );
};

export default SkeletonImageLoader;
