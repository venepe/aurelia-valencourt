import { Box } from '@mui/material';

const emptyStateImage = '/assets/cocktail_empty_glass.png';

const NoResults = () => (
  <Box
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    mt={4}
    sx={{ width: '100%' }}
  >
    <Box
      component="img"
      src={emptyStateImage}
      alt="No matching cocktails"
      sx={{
        width: 150,
        height: 150,
        opacity: 0.7,
      }}
    />
  </Box>
);

export default NoResults;
