import AuthLayout from '../components/AuthPageLayout';
import SignInForm from '../components/SignInForm';

export default function Login() {
  return (
    <>
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
