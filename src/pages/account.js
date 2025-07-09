import dynamic from 'next/dynamic';
import Head from 'next/head';
import DefaultHead from '../components/DefaultHead';
import R from '../resources';
const Account = dynamic(() => import('../components/Account'), { ssr: false });

export default function AccountPage() {
  const title = `Account | ${R.strings.APP_NAME}`;
  return (
    <>
      <DefaultHead
        title={title}
      />
      <Account />
    </>
  );
}
