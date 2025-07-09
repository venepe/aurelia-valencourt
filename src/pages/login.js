import DefaultHead from '../components/DefaultHead';
import Login from '../components/Login';
import R from '../resources';

export default function LoginPage() {
  const title = `Login | ${R.strings.APP_NAME}`;
  return (
    <>
      <DefaultHead
        title={title}
        url={`https://aureliavalencourt.com/login`}
      />
      <Login />
    </>
  );
}
