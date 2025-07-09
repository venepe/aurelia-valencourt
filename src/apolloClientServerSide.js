import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { GRAPHQL_SERVER_SIDE_URL } from './config';

// Configure the cache without type policies
const cache = new InMemoryCache();

// Configure the HttpLink
const httpLink = new HttpLink({
  uri: GRAPHQL_SERVER_SIDE_URL,
});

// Configure retry logic
const retryLink = new RetryLink({
  delay: {
    initial: 300, // Retry after 300ms
    max: Infinity, // No maximum delay between retries
    jitter: true, // Randomize delay to avoid retry storms
  },
  attempts: {
    max: 5, // Retry up to 5 times
    retryIf: async (error, operation) => {
      // Retry only if network error or retryable GraphQL errors
      if (error && error.networkError) {
        console.error(`Retrying ${operation.operationName} due to network error:`, error);
        return true;
      }
      return false;
    },
  },
});

// Combine retryLink and httpLink
const link = ApolloLink.from([retryLink, httpLink]);

// Create Apollo Client
const client = new ApolloClient({
  link,
  cache,
});

export default client;
