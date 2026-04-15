import AuthCard from "../components/AuthCard";
import ForgotPasswordForm from "../components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset Password"
      subtitle="Enter your email and we will send a secure OTP code to continue."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
