import AuthCard from "../components/AuthCard";
import SignInForm from "../components/SignInForm";

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue to your restaurant operations dashboard."
    >
      <SignInForm />
    </AuthCard>
  );
}
