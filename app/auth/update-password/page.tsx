import AuthCard from "../components/AuthCard";
import UpdatePasswordForm from "../components/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <AuthCard
      title="Choose a New Password"
      subtitle="Set a new password for your account and continue to dashboard access."
    >
      <UpdatePasswordForm />
    </AuthCard>
  );
}
