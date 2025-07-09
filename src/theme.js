import { red, amber } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

// A luxurious modern Chinese/Korean-inspired theme with a majestic blue color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2A4D8C', // Imperial Sapphire Blue
      light: '#5D7FB7', // Muted Sky Blue
      dark: '#1D3666', // Deep Cobalt Blue
    },
    secondary: {
      main: '#BF3131', // Imperial Crimson (contrast & richness)
      light: '#D86A6A', // Soft Ruby Red (subtle accents)
      dark: '#8C2424', // Deep Forbidden Red (for highlights)
    },
    accent: {
      main: '#CFA146', // Gold Foil Accents (luxury feel)
    },
    error: {
      main: red[700], // Keeping a bold crimson for contrast
    },
    background: {
      default: '#F8F5F0', // Porcelain White with a warm tone
      paper: '#E8ECF2', // Delicate warm ivory-blue background
    },
    text: {
      primary: '#2A2F3A', // Deep blue-gray for elegance and readability
      secondary: '#5A5E6B', // Muted grayish-blue for subtle contrast
      accent: '#CFA146', // Gold for decorative text (like cocktail names)
    },
  },
  typography: {
    fontFamily: `'Poppins', 'Noto Sans', sans-serif`, // Balanced modern & traditional
    h1: {
      fontFamily: `'Playfair Display', serif`, // Calligraphic luxury
      fontWeight: 600,
      fontSize: '3.2rem',
      letterSpacing: '-0.02em',
      color: '#1D3666', // Deep Royal Blue for striking headers
    },
    h2: {
      fontFamily: `'Playfair Display', serif`,
      fontWeight: 500,
      fontSize: '2rem',
      color: '#2A4D8C', // Imperial Blue headers
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.7,
      fontWeight: 400,
      color: '#2A2F3A', // Darker shade for better readability
    },
    body2: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#5A5E6B', // Soft contrast grayish-blue
    },
    button: {
      fontSize: '1rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#F8F5F0',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.2)',
          textTransform: 'none',
          transition: '0.4s ease',
          backgroundColor: '#2A4D8C',
          color: '#E8ECF2',
          '&:hover': {
            backgroundColor: '#CFA146', // Luxurious gold accent on hover
            color: '#2A2F3A',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)',
          backgroundColor: '#E8ECF2',
          border: '1px solid rgba(42, 77, 140, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1D3666', // Deep Royal Blue for a luxury bar feel
          borderBottom: '2px solid #CFA146', // Gold accent underlining
          boxShadow: '0px 6px 14px rgba(0, 0, 0, 0.3)',
        },
      },
    },
  },
});

export default theme;
