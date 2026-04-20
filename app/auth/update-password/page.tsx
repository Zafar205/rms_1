import { Suspense } from "react";
import AuthCard from "../components/AuthCard";
import UpdatePasswordForm from "../components/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <AuthCard
      title="Choose a New Password"
      subtitle="After OTP verification, set a new password to secure your account."
    >
      <Suspense fallback={<p className="text-sm text-stone-300">Loading password form...</p>}>
        <UpdatePasswordForm />
      </Suspense>
    </AuthCard>
  );
}
