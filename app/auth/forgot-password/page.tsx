import AuthCard from "../components/AuthCard";
import ForgotPasswordForm from "../components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset Password"
      subtitle="Enter your email and we will send you a secure password reset link."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
