import dynamic from 'next/dynamic';
import { gql } from '@apollo/client';
import DefaultHead from '../../../components/DefaultHead';
import client from '../../../apolloClientServerSide';
import { convertImageUrl, generateCocktailUrl } from '../../../utilities';
import R from '../../../resources';
import Head from 'next/head';
const CocktailDetail = dynamic(() => import('../../../components/CocktailDetail'), { ssr: false });

const COCKTAIL_BY_COCKTAIL_ID = gql`
  query CocktailByCocktailIdPage($cocktailId: UUID!) {
    cocktailByCocktailId(cocktailId: $cocktailId) {
      nodeId
      cocktailId
      title
      description
      history
      origin
      glassType
      garnish
      rating
      ratingCount
      prepTime {
        seconds
        minutes
        hours
      }
      cocktailImagesByCocktailId(orderBy: [IMAGE_ORDER_ASC], first: 1) {
        nodes {
          imageUrl
        }
      }
      cocktailIngredientsByCocktailId {
        nodes {
          ingredientByIngredientId {
            nodeId
            ingredientId
            ingredientName
          }
          quantity
          specialQuantity
          unitByUnitId {
            unitAbbreviation
            unitName
          }
        }
      }
      instructionsByCocktailId {
        nodes {
          instructionId
          instructionText
          hint
          stepNumber
        }
      }
      cocktailTagsByCocktailId {
        nodes {
          tagByTagId {
            tagId
            tagName
          }
        }
      }
    }
  }
`;

export default function CocktailDetailPage({ cocktail }) {
  let {
    description = R.strings.APP_DESCRIPTION,
  } = cocktail || {};

  let imageUrl = R.strings.APP_LOGO_BANNER_URL;
  let title = R.strings.APP_TITLE;

  // Check if cocktail exists and has images
  if (cocktail?.cocktailImagesByCocktailId?.nodes?.length) {
    imageUrl = convertImageUrl(cocktail.cocktailImagesByCocktailId.nodes[0].imageUrl);
  }
  if (cocktail?.title) {
    title = `${cocktail.title} | ${R.strings.APP_NAME}`;
  }

  // Prepare JSON-LD structured data for Schema.org Recipe type
  const recipeSchema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": cocktail?.title || title,
    "image": imageUrl,
    "description": cocktail?.description || description,
    "prepTime": `PT${cocktail?.prepTime?.hours || 0}H${cocktail?.prepTime?.minutes || 0}M${cocktail?.prepTime?.seconds || 0}S`,
    "recipeYield": "1 serving",
    "recipeCategory": "Cocktail",
    "recipeCuisine": cocktail?.origin || "International",
    "keywords": cocktail?.cocktailTagsByCocktailId?.nodes.map(tag => tag.tagByTagId.tagName).join(", "),
    "recipeIngredient": cocktail?.cocktailIngredientsByCocktailId?.nodes.map(ingredient => {
      const quantity = ingredient.quantity || ingredient.specialQuantity || "";
      const unit = ingredient.unitByUnitId?.unitAbbreviation || "";
      const name = ingredient.ingredientByIngredientId.ingredientName || "";
      return `${quantity} ${unit} ${name}`.trim();
    }),
    "recipeInstructions": cocktail?.instructionsByCocktailId?.nodes.map(step => ({
      "@type": "HowToStep",
      "text": step.instructionText,
      "position": step.stepNumber
    })),
    "author": {
      "@type": "Person",
      "name": R.strings.APP_NAME
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": cocktail?.rating || "4.8",
      "ratingCount": cocktail?.ratingCount || "1"
    }
  };

  return (
    <>
      <DefaultHead
        title={title}
        description={description}
        imageUrl={imageUrl}
        url={cocktail?.cocktailId ? `https://aureliavalencourt.com${generateCocktailUrl(cocktail.cocktailId, cocktail.title)}` : 'https://aureliavalencourt.com'}
        recipeSchema={recipeSchema}
      />
      <CocktailDetail cocktail={cocktail} />
    </>
  );
}

// Fetch data using getServerSideProps
export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const { data } = await client.query({
      query: COCKTAIL_BY_COCKTAIL_ID,
      variables: { cocktailId: id },
    });

    return {
      props: {
        cocktail: data.cocktailByCocktailId || null, // Use null as fallback
      },
    };
  } catch (error) {
    console.error('Error fetching cocktail data:', error);
    return {
      props: {
        cocktail: null,
      },
    };
  }
}
