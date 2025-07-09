import React from 'react';
import { Container, Typography, Box, Divider, Link } from '@mui/material';

const PrivacyTermsPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          Last modified: September 1, 2024
        </Typography>

        <Typography component="h2" variant="h6" gutterBottom>
          What information do we collect?
        </Typography>
        <Typography component="p" variant="subtitle1" gutterBottom>
          1. When you give it to us
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          When you sign up for or use our products, you voluntarily give us certain information. This can include your name,
          profile photo, the email address you used to sign up, and any other information you provide us. If you’re using our
          service on your mobile device, you can also choose to provide us with location data.
        </Typography>
        <Typography component="p" variant="subtitle1" gutterBottom>
          2. We also get technical information when you use our products
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          Log data. When you use our site, our servers automatically record information (“log data”), including information
          that your browser sends whenever you visit a website or your mobile app sends when you’re using it. This log data may
          include your Internet Protocol address, browser type and settings, the date and time of your request, how you used
          our site, and cookie data.
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          Device information. In addition to log data, we may also collect information about the device you’re using on our
          site, including what type of device it is, what operating system you’re using, device settings, unique device
          identifiers, and crash data.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography component="h2" variant="h6" gutterBottom>
          What do we use your information for?
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          Any of the information we collect from you may be used in one of the following ways:
        </Typography>
        <ul>
          <li><Typography component="p" variant="body1">To personalize your experience</Typography></li>
          <li><Typography component="p" variant="body1">To improve our website</Typography></li>
          <li><Typography component="p" variant="body1">To improve customer service</Typography></li>
        </ul>

        <Divider sx={{ my: 4 }} />

        <Typography component="h2" variant="h6" gutterBottom>
          Do we disclose any information to outside parties?
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information, except to
          trusted third parties who assist us in operating our website.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography component="h2" variant="h6" gutterBottom>
          California Online Privacy Protection Act Compliance
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          We are in compliance with the requirements of the California Online Privacy Protection Act. You may make changes to
          your information at any time by logging into your control panel.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography component="h2" variant="h6" gutterBottom>
          Childrens Online Privacy Protection Act Compliance
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          We comply with COPPA, and do not collect information from anyone under 13 years of age.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography component="h2" variant="h6" gutterBottom>
          Your Consent
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          By using our site, you consent to our web site privacy policy.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography component="h2" variant="h6" gutterBottom>
          Contacting Us
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          If you have any questions regarding this privacy policy, contact us at{' '}
          <Link href="mailto:support@aureliavalencourt.com">support@aureliavalencourt.com</Link>.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 2 }}>
          <Typography component="p" variant="body2">
            Read our <Link href="/terms-of-service">Terms of Service</Link>.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default PrivacyTermsPage;
