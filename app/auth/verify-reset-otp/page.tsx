import AuthCard from "../components/AuthCard";
import VerifyResetOtpForm from "../components/VerifyResetOtpForm";

export default function VerifyResetOtpPage() {
  return (
    <AuthCard
      title="Verify Reset OTP"
      subtitle="Enter the OTP from your email to continue to password reset."
    >
      <VerifyResetOtpForm />
    </AuthCard>
  );
}
