import DefaultHead from '../components/DefaultHead';
import ResetPassword from '../components/ResetPassword';
import R from '../resources';

export default function ResetPasswordPage() {
  const title = `Sign up | ${R.strings.APP_NAME}`;
  return (
    <>
      <DefaultHead
        title={title}
      />
      <ResetPassword />
    </>
  );
}
