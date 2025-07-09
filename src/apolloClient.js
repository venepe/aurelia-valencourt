import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';
import { setContext } from '@apollo/client/link/context';
import { RetryLink } from '@apollo/client/link/retry';
import { getStore } from './store';
import { logout } from './store/reducers/authSlice';
import { API_URL, GRAPHQL_URL } from './config';

const CACHE_KEY = 'apollo-cache-persist';
const EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7; // 7 days

// Function to check cache expiration
const isCacheExpired = () => {
  if (typeof window !== "undefined") {
    const timestamp = localStorage.getItem(`${CACHE_KEY}-timestamp`);
    if (!timestamp) return true; // No timestamp means cache is expired
    return Date.now() - Number(timestamp) > EXPIRATION_TIME;
  }
};

// Clear cache if expired
if (isCacheExpired()) {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(`${CACHE_KEY}-timestamp`);
}

const cache = new InMemoryCache({
  typePolicies: {
    Cocktail: { keyFields: ['cocktailId'] },
    CocktailRating: { keyFields: ['nodeId'] },
    Tag: {
      keyFields: ["tagId"],
      fields: {
        cocktailTagsByTagId: {
          keyArgs: ["first", "after"], // ✅ Handles pagination for cocktails in each tag
          merge(existing = { edges: [], pageInfo: {} }, incoming, { args }) {
            if (args?.after) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
                pageInfo: incoming.pageInfo,
              };
            }
            return incoming;
          },
        },
      },
    },
    Query: {
      fields: {
        cocktailByCocktailId: {
          keyArgs: ["cocktailId"], // ✅ Ensures each cocktail is cached separately by its ID
          read(existing) {
            return existing || undefined; // ✅ Ensures cache reads return existing data first
          },
          merge(existing, incoming) {
            return { ...existing, ...incoming }; // ✅ Merges instead of replacing
          },
        },
        getRelevantTags: {
          keyArgs: ["tagNames", "searchText", "first"], // ✅ Differentiates queries by `first` to avoid overwriting
          read(existing) {
            return existing || undefined; // ✅ Ensures cache reads return existing data first
          },
          merge(existing = { edges: [], pageInfo: {} }, incoming, { args }) {
            // ✅ If `after` is provided, append new results (pagination)
            if (args?.after) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
                pageInfo: incoming.pageInfo, // ✅ Update cursor properly
              };
            }

            // ✅ If no `after`, treat as a fresh query (not pagination)
            return incoming;
          },
        },
        searchCocktailAndTag: {
          keyArgs: ["searchText", "tagList", "first"], // ✅ Differentiates searches by search text to avoid overwriting
          read(existing) {
            return existing || undefined; // ✅ Ensures cache reads return existing data first
          },
          merge(existing = { edges: [], pageInfo: {} }, incoming, { args }) {
            // ✅ If `after` is provided, append new results (pagination)
            if (args?.after) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
                pageInfo: incoming.pageInfo, // ✅ Update cursor properly
              };
            }

            // ✅ If no `after`, treat as a fresh query (not pagination)
            return incoming;
          },
        },
        allTags: {
          keyArgs: ["condition", ["tagId"]], // ✅ Differentiates cache by `tagId`
          merge(existing = { edges: [] }, incoming) {
            return {
              ...incoming,
              edges: [...existing.edges, ...incoming.edges], // ✅ Merges new tags without overwriting
            };
          },
        },
      },
    },
  },
});

// ✅ Only persist cache in the browser (client-side)
if (typeof window !== "undefined") {
  persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
  }).then(() => {
    // Store timestamp when cache is persisted
    localStorage.setItem(`${CACHE_KEY}-timestamp`, Date.now().toString());
  }).catch((error) => {
    console.error("Apollo Cache Persist Error:", error);
  });
}

const httpLink = new HttpLink({ uri: GRAPHQL_URL });

const authLink = setContext((_, { headers }) => {
  if (typeof window === "undefined") return { headers }; // Avoid accessing localStorage in SSR

  const token = localStorage.getItem('token');
  const sessionId = localStorage.getItem('sessionId');
  return {
    headers: {
      ...headers,
      ...(sessionId ? { 'X-Session-Id': sessionId } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    }
  };
});

const renewToken = async () => {
  if (typeof window === "undefined") return null; // Prevent SSR error

  const refreshToken = localStorage.getItem('refresh-token');
  const response = await fetch(`${API_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    console.error('Failed to refresh token:', response.status, await response.text());
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.token;
};

const retryLink = new RetryLink({
  delay: { initial: 0 },
  attempts: {
    max: 5,
    retryIf: async (error, operation) => {
      if (typeof window === "undefined") return false; // Prevent SSR error

      if (error.statusCode === 401 || error.statusCode === 403 || error.statusCode === 500) {
        try {
          const newToken = await renewToken();
          operation.setContext(({ headers = {} }) => ({
            headers: { ...headers, authorization: `Bearer ${newToken}` },
          }));
          return true;
        } catch (err) {
          console.error('Token renewal failed:', err);
          getStore().dispatch(logout());
          window.location.href = '/';
          return false;
        }
      }
      return false;
    },
  },
});

const client = new ApolloClient({
  ssrMode: typeof window === "undefined",
  link: authLink.concat(retryLink).concat(httpLink),
  cache,
});

export default client;
