import DefaultHead from '../components/DefaultHead';
import Signup from '../components/Signup';
import R from '../resources';

export default function SignupPage() {
  const title = `Sign up | ${R.strings.APP_NAME}`;
  return (
    <>
      <DefaultHead
        title={title}
        url={`https://aureliavalencourt.com/signup`}
      />
      <Signup />
    </>
  );
}
