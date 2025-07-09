import dynamic from 'next/dynamic';
import DefaultHead from '../components/DefaultHead';
import R from '../resources';
const FavoriteCocktailList = dynamic(() => import('../components/FavoriteCocktailList'), { ssr: false });

export default function PinnedPage() {
  const title = `Collection | ${R.strings.APP_NAME}`;
  return (
    <>
      <DefaultHead
        title={title}
        url={`https://aureliavalencourt.com/collection`}
      />
      <FavoriteCocktailList />
    </>
  );
}
