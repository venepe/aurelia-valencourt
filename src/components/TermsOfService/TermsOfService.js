import React from 'react';
import { Container, Typography, Box, Divider, Link } from '@mui/material';

const TermsOfServicePage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Terms of Service
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          Last modified: September 1, 2024
        </Typography>

        <Typography component="h2" variant="h6" gutterBottom>
          Our Service Terms
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          The terms found here apply to any software (including any updates or upgrades to the software and any related
          documentation) that we make available to you from time to time for your use in connection with our Services (the
          "Service").
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography component="h2" variant="h6" gutterBottom>
          Alcohol Content and Legal Compliance
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          Our service may contain content, products, or information related to alcoholic beverages. By accessing and using our
          service, you confirm that you are of legal drinking age in your jurisdiction. You agree to comply with all applicable
          laws and regulations regarding the purchase, consumption, and advertising of alcohol.
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          We strongly encourage responsible drinking and do not promote excessive or irresponsible consumption of alcohol.
          Users are advised to drink responsibly and to refrain from drinking and driving.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography component="h2" variant="h6" gutterBottom>
          Disclaimer of Warranties and Limitation of Liability
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          OUR SERVICES AND ALL INFORMATION, CONTENT, MATERIALS, PRODUCTS (INCLUDING SOFTWARE) AND OTHER SERVICES INCLUDED ON OR
          OTHERWISE MADE AVAILABLE TO YOU ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, UNLESS OTHERWISE SPECIFIED IN
          WRITING. THE AUTHOR MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, AS TO THE OPERATION OF
          THE SERVICES, OR THE INFORMATION, CONTENT, MATERIALS, PRODUCTS (INCLUDING SOFTWARE) OR OTHER SERVICES INCLUDED ON OR
          OTHERWISE MADE AVAILABLE TO YOU THROUGH THE SERVICES, UNLESS OTHERWISE SPECIFIED IN WRITING. YOU EXPRESSLY AGREE
          THAT YOUR USE OF THE SERVICES IS AT YOUR SOLE RISK.
        </Typography>

        <Typography component="p" variant="body1" paragraph>
          TO THE FULL EXTENT PERMISSIBLE BY APPLICABLE LAW, THE AUTHOR DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING,
          BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE AUTHOR DOES NOT
          WARRANT THAT THE SERVICES, INFORMATION, CONTENT, MATERIALS, PRODUCTS (INCLUDING SOFTWARE) OR OTHER SERVICES INCLUDED
          ON OR OTHERWISE MADE AVAILABLE TO YOU THROUGH THE SERVICES, OUR SERVERS OR ELECTRONIC COMMUNICATIONS SENT FROM US ARE
          FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. THE AUTHOR WILL NOT BE LIABLE FOR ANY DAMAGES OF ANY KIND ARISING FROM
          THE USE OF ANY SERVICE, OR FROM ANY INFORMATION, CONTENT, MATERIALS, PRODUCTS (INCLUDING SOFTWARE) OR OTHER SERVICES
          INCLUDED ON OR OTHERWISE MADE AVAILABLE TO YOU THROUGH ANY SERVICE, INCLUDING, BUT NOT LIMITED TO DIRECT, INDIRECT,
          INCIDENTAL, PUNITIVE, AND CONSEQUENTIAL DAMAGES, UNLESS OTHERWISE SPECIFIED IN WRITING.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography component="h2" variant="h6" gutterBottom>
          Certain State Laws
        </Typography>
        <Typography component="p" variant="body1" paragraph>
          CERTAIN STATE LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES.
          IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS, EXCLUSIONS, OR LIMITATIONS MAY NOT APPLY TO YOU,
          AND YOU MIGHT HAVE ADDITIONAL RIGHTS.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 2 }}>
          <Typography component="p" variant="body2">
            Read our <Link href="/privacy">Privacy Policy</Link>.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default TermsOfServicePage;
