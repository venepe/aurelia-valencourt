import { Card, CardMedia, Box, Typography, Skeleton } from "@mui/material";
import useDetectMobile from '../../hooks/useDetectMobile';

const CocktailCardSkeleton = () => {
  const isMobile = useDetectMobile();
  const width = isMobile ? "100%" : 416;
  return (
    <Card
      sx={{
        position: "relative",
        boxShadow: 4,
        borderRadius: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        maxWidth: '416px',
        bgcolor: "background.paper",
      }}
    >
      {/* Skeleton for Image */}
      <Skeleton variant="rectangular" width={width} height={400} />

      {/* Skeleton for Favorite Button */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: "grey.300",
        }}
      />

      {/* Skeleton for Title and Description */}
      <Box
        sx={{
          padding: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          bgcolor: "background.default",
          width: "100%",
        }}
      >
        <Skeleton variant="text" width="60%" height={30} />
        <Box display="flex" alignItems="center" mb={1}>
          <Skeleton variant="text" width={80} height={20} />
          <Skeleton variant="text" width={40} height={20} sx={{ ml: 1 }} />
          <Skeleton variant="text" width={50} height={20} sx={{ ml: 1 }} />
        </Box>
        <Skeleton variant="text" width="90%" height={20} />
        <Skeleton variant="text" width="85%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
      </Box>
    </Card>
  );
};

export default CocktailCardSkeleton;
