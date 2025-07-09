import Head from 'next/head';
import TermsOfService from '../components/TermsOfService';
import DefaultHead from '../components/DefaultHead';
import R from '../resources';

export default function ForgotPasswordPage() {
  const title = `Terms of Service | ${R.strings.APP_NAME}`;
  return (
    <>
      <DefaultHead
        title={title}
      />
      <TermsOfService />
    </>
  );
}
