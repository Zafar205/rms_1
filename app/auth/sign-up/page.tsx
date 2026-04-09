import AuthCard from "../components/AuthCard";
import SignUpForm from "../components/SignUpForm";

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create Staff Account"
      subtitle="Create an admin or cashier account. You will confirm this account by email."
    >
      <SignUpForm />
    </AuthCard>
  );
}
