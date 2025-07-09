import dynamic from 'next/dynamic';
import { gql } from '@apollo/client';
import client from '../apolloClientServerSide';
import DefaultHead from '../components/DefaultHead';
import { convertImageUrl } from '../utilities';
import R from '../resources';
const Landing = dynamic(() => import('../components/Landing'), { ssr: false });

// GraphQL query to search for cocktails
const SEARCH_COCKTAILS = gql`
  query SearchCocktails($searchText: String!, $first: Int, $after: Cursor) {
    searchCocktail(searchText: $searchText, first: $first, after: $after) {
      edges {
        node {
          nodeId
          cocktailId
          title
          description
          cocktailImagesByCocktailId(orderBy: [IMAGE_ORDER_ASC], first: 1) {
            nodes {
              imageUrl
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export default function HomePage({ searchText, cocktails }) {
  let title = searchText ? `${searchText} results | ${R.strings.APP_NAME}` : R.strings.APP_TITLE;
  let description = R.strings.APP_DESCRIPTION;
  let imageUrl = R.strings.APP_LOGO_BANNER_URL;

  // If there are search results, use the first cocktail's image and details
  if (searchText && cocktails && cocktails.length > 0) {
    const firstCocktail = cocktails[0];

    // Check if cocktail has images
    if (firstCocktail?.cocktailImagesByCocktailId?.nodes?.length > 0) {
      imageUrl = convertImageUrl(firstCocktail.cocktailImagesByCocktailId.nodes[0].imageUrl);
    }
  }

  return (
    <>
      <DefaultHead
        title={title}
        description={description}
        imageUrl={imageUrl}
        url={searchText ? `https://aureliavalencourt.com/?query=${searchText}` : 'https://aureliavalencourt.com'}
      />
      <Landing />
    </>
  );
}

// Fetch data using getServerSideProps
export async function getServerSideProps(context) {
  const { query: searchText } = context.query;

  let cocktails = [];
  if (searchText) {
    try {
      // Execute the search query on the server side using Apollo Client
      const { data } = await client.query({
        query: SEARCH_COCKTAILS,
        variables: { searchText, first: 1 },
      });

      if (data?.searchCocktail?.edges) {
        cocktails = data.searchCocktail.edges.map(edge => edge.node);
      }
    } catch (error) {
      console.error('Error fetching cocktails:', error);
    }
  }

  return {
    props: {
      searchText: searchText || '',
      cocktails,
    },
  };
}
