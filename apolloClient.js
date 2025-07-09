const { ApolloClient, InMemoryCache, HttpLink } = require('@apollo/client');
const fetch = require('cross-fetch');
const { GRAPHQL_URL } = require('./config');

const client = new ApolloClient({
  link: new HttpLink({
    uri: GRAPHQL_URL,
    fetch,
  }),
  cache: new InMemoryCache(),
});

module.exports = client;
