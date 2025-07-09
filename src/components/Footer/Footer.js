import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      Venepe, LLC. {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const footers = [
  {
    description: [
      {
        name: 'Privacy Policy',
        url: '/privacy',
      },
      {
        name: 'Terms of Service',
        url: '/terms-of-service',
      },
    ],
  },
  {
    description: [
      {
        name: 'Bluesky',
        url: 'https://bsky.app/profile/aureliavalencourt.bsky.social',
      },
      {
        name: 'Facebook',
        url: 'https://www.facebook.com/aureliavalencourt',
      }
    ],
  },
  {
    description: [
      {
        name: 'Messenger',
        url: 'https://m.me/aureliavalencourt',
      },
      {
        name: 'YouTube',
        url: 'https://www.youtube.com/@AureliaValencourt',
      },
    ],
  },
];

export default function Footer() {

  return (
    <React.Fragment>
      <Container maxWidth="md" style={{ marginTop: 15, marginBottom: 10, padding: 2 }}>
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          {footers.map((footer, index) => (
            <Grid
              item
              xs={12}
              sm={4}
              key={index}
              container
              direction="column"
              alignItems="center"
              justifyContent="center"
            >
              {footer.description.map((item) => (
                <Link
                  key={item.name}
                  href={item.url}
                  sx={{ pt: 1 }}
                  variant="subtitle2"
                  color="textSecondary"
                  align="center"
                >
                  {item.name}
                </Link>
              ))}
            </Grid>
          ))}
        </Grid>
        <Grid container justifyContent="center" alignItems="center" style={{ marginTop: '1rem' }}>
          <Grid item xs={12} sm={4}>
            <Copyright />
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}
