import DefaultHead from '../components/DefaultHead';
import { Container, Typography, Box, Divider } from '@mui/material';
import R from '../resources';

export default function DataDeletionPage() {
  const title = `Data Deletion | ${R.strings.APP_NAME}`;
  return (
    <>
      <DefaultHead
        title={title}
      />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Data Deletion
          </Typography>

          <Typography component="h2" variant="h6" gutterBottom>
            Deleting User Data
          </Typography>
          <Typography component="p" variant="body1" paragraph>
            To request the deletion of your personal data, please send a request to:
            <strong>support@aureliavalencourt.com</strong>.
          </Typography>
          <Typography component="p" variant="body1" paragraph>
            Include the subject <strong>"Request deletion"</strong> and ensure you send the request
            from the email account used to create your account.
          </Typography>

          <Divider sx={{ my: 4 }} />
        </Box>
      </Container>
    </>
  );
}
