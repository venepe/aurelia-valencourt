import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Provider, useDispatch } from 'react-redux';
import { ApolloProvider } from '@apollo/client';
import { GoogleAnalytics } from 'nextjs-google-analytics';
import { ThemeProvider } from '@mui/material/styles';
import { styled } from '@mui/system';
import Layout from '../components/Layout';
import ScrollRestoration from '../components/ScrollRestoration';
import { CallToActionModalProvider } from '../components/CallToActionModal';
import { SignupModalProvider } from '../components/SignupModal';
import { VoiceModalProvider } from '../components/VoiceModal';
import { useLoadAuthState } from '../store/reducers/authSlice';
import client from '../apolloClient';
import theme from '../theme.js';
import { initStore } from '../store';
import { initializeSessionId } from '../utilities';
import { setSessionId } from '../store/reducers/sessionSlice';
import { checkWebPSupportAsync } from '../store/reducers/webpSlice';
import { hydrateUnitAsync } from '../store/reducers/unitsOfMeasureSlice';
import '../styles/globals.css';
import { GA_MEASUREMENT_ID } from '../config';
import R from '../resources';

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default, // Use theme background color
  color: theme.palette.text.primary, // Ensure text color aligns with theme
  fontFamily: theme.typography.fontFamily, // Use the theme's font family
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow for added depth
  borderRadius: '8px', // Slightly rounded corners for a modern touch
}));

const store = initStore();

export default function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <VoiceModalProvider>
            <SignupModalProvider>
              <CallToActionModalProvider>
                <AuthLoader>
                  <Layout>
                    <Root>
                      <ScrollRestoration />
                      <GoogleAnalytics trackPageViews gaMeasurementId={GA_MEASUREMENT_ID} />
                      <Component {...pageProps} />
                    </Root>
                  </Layout>
                </AuthLoader>
              </CallToActionModalProvider>
            </SignupModalProvider>
          </VoiceModalProvider>
        </ThemeProvider>
      </ApolloProvider>
    </Provider>
  );
}

function AuthLoader({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkWebPSupportAsync());
    dispatch(hydrateUnitAsync());
  }, [dispatch]);

  // Load the auth state from localStorage on the client after the Provider is ready
  useLoadAuthState(dispatch);
  const sessionId = initializeSessionId();
  dispatch(setSessionId(sessionId));

  return children;
}
