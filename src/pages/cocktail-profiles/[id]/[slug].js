import dynamic from 'next/dynamic';
import { gql, useQuery, useMutation } from '@apollo/client';
import DefaultHead from '../../../components/DefaultHead';
import client from '../../../apolloClientServerSide';
import { convertImageUrl, toTitleCase, generateProfileUrl } from '../../../utilities';
import R from '../../../resources';
const TagCocktailList = dynamic(() => import('../../../components/TagCocktailList'), { ssr: false });

export const TAG_BY_TAG_ID = gql`
  query TagByTagIdPage($tagId: UUID!) {
    tagByTagId(tagId: $tagId) {
      tagName
      tagId
      description
      imageUrl
    }
  }
`;

export default function TagPage({ tag }) {

  const title = tag?.tagName ? `${toTitleCase(tag.tagName)} | ${R.strings.APP_NAME}` : R.strings.APP_TITLE;
  const description = tag?.description || R.strings.APP_DESCRIPTION;

  // Fallback values for SEO metadata
  let imageUrl = R.strings.APP_LOGO_BANNER_URL;

  if (tag?.imageUrl) {
    imageUrl = `${convertImageUrl(tag.imageUrl)}`;
  }

  return (
    <>
      <DefaultHead
        title={title}
        description={description}
        imageUrl={imageUrl}
        url={`https://aureliavalencourt.com${generateProfileUrl(tag.tagId, tag.tagName)}`}
      />
      <TagCocktailList />
    </>
  );
}

// Fetch data using getServerSideProps
export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const { data } = await client.query({
      query: TAG_BY_TAG_ID,
      variables: { tagId: id },
    });

    return {
      props: {
        tag: data.tagByTagId || null, // Use null as fallback
      },
    };
  } catch (error) {
    console.error('Error fetching allTags data:', error);
    return {
      props: {
        tag: null, // Return null or a fallback object in case of error
      },
    };
  }
}
