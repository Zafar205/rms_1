import AuthCard from "../components/AuthCard";
import UpdatePasswordForm from "../components/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <AuthCard
      title="Choose a New Password"
      subtitle="After OTP verification, set a new password to secure your account."
    >
      <UpdatePasswordForm />
    </AuthCard>
  );
}
