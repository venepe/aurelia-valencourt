import Head from 'next/head';
import Privacy from '../components/Privacy';
import DefaultHead from '../components/DefaultHead';
import R from '../resources';

export default function ForgotPasswordPage() {
  const title = `Privacy Policy | ${R.strings.APP_NAME}`;
  return (
    <>
      <DefaultHead
        title={title}
      />
      <Privacy />
    </>
  );
}
