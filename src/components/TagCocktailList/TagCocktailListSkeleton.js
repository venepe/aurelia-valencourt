import { Box, Skeleton } from "@mui/material";
import { Masonry } from '@mui/lab';
import CocktailCardSkeleton from '../CocktailCardSkeleton';

const TagCocktailListSkeleton = () => {
  return (
    <Box sx={{ p: 2, minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="rectangular" width="100%" height={420} sx={{ borderRadius: 3, mb: 3 }} />
        <Skeleton variant="text" width="60%" sx={{ mb: 1, mx: 'auto' }} />
        <Skeleton variant="text" width="40%" sx={{ mb: 4, mx: 'auto' }} />
      </Box>
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
    </Box>
  );
};

export default TagCocktailListSkeleton;
