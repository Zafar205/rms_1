import { Suspense } from "react";
import AuthCard from "../components/AuthCard";
import SignInForm from "../components/SignInForm";

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue to your restaurant operations dashboard."
    >
      <Suspense fallback={<p className="text-sm text-stone-300">Loading sign-in form...</p>}>
        <SignInForm />
      </Suspense>
    </AuthCard>
  );
}
