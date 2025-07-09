import dynamic from 'next/dynamic';
import { gql, useQuery, useMutation } from '@apollo/client';
import DefaultHead from '../../../components/DefaultHead';
import client from '../../../apolloClientServerSide';
import { convertImageUrl, toTitleCase, generateEquipmentUrl } from '../../../utilities';
import R from '../../../resources';
const EquipmentReview = dynamic(() => import('../../../components/EquipmentReview'), { ssr: false });

// GraphQL query to fetch equipment by ID
export const GET_EQUIPMENT_BY_ID = gql`
  query EquipmentByEquipmentIdPage($equipmentId: UUID!) {
    equipmentByEquipmentId(equipmentId: $equipmentId) {
      nodeId
      equipmentId
      name
      description
      imageUrl
    }
  }
`;

// EquipmentPage component
export default function EquipmentPage({ equipment }) {
  // Construct SEO metadata
  const title = equipment?.name
    ? `${toTitleCase(equipment.name)} | ${R.strings.APP_NAME}`
    : R.strings.APP_TITLE;

  const description = equipment?.description || R.strings.APP_DESCRIPTION;

  const imageUrl = equipment?.imageUrl
    ? convertImageUrl(equipment.imageUrl)
    : R.strings.APP_LOGO_BANNER_URL;

  return (
    <>
      <DefaultHead
        title={title}
        description={description}
        imageUrl={imageUrl}
        url={`https://aureliavalencourt.com${generateEquipmentUrl(equipment?.equipmentId, equipment?.name)}`}
      />
      <EquipmentReview equipment={equipment} />
    </>
  );
}

// Fetch data for server-side rendering
export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const { data } = await client.query({
      query: GET_EQUIPMENT_BY_ID,
      variables: { equipmentId: id },
    });

    return {
      props: {
        equipment: data.equipmentByEquipmentId || null, // Fallback to null if no data
      },
    };
  } catch (error) {
    console.error('Error fetching equipment data:', error);
    return {
      props: {
        equipment: null,
      },
    };
  }
}
