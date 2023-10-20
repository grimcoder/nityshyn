import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// If you have an Apollo Server setup somewhere, replace this URL.
// In production, this might be an environment variable.
const API_URL = 'http://localhost:3000/api/graphql';

const httpLink = new HttpLink({
  uri: API_URL,
  credentials: 'include',  // Use 'include' if you have authentication setup and want to send credentials with every request to the API.
});

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default apolloClient;
