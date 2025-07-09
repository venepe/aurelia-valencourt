import { Box, Skeleton } from "@mui/material";

const EquipmentReviewSkeleton = () => {
  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Header Image Skeleton */}
        <Skeleton variant="rectangular" width="100%" height={300} sx={{ mb: 4 }} />

        {/* Equipment Details Skeleton */}
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 4 }} />

        {/* Equipment Criteria Skeleton */}
        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 4 }} />
        {Array.from({ length: 3 }).map((_, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Skeleton variant="text" width="30%" height={20} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={100} />
          </Box>
        ))}
      </Box>
  );
};

export default EquipmentReviewSkeleton;
