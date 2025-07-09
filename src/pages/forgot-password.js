import Head from 'next/head';
import ForgotPassword from '../components/ForgotPassword';
import DefaultHead from '../components/DefaultHead';
import R from '../resources';

export default function ForgotPasswordPage() {
  const title = `Forgot password | ${R.strings.APP_NAME}`;
  return (
    <>
      <DefaultHead
        title={title}
      />
      <ForgotPassword />
    </>
  );
}
