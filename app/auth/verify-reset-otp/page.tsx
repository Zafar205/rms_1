import { Suspense } from "react";
import AuthCard from "../components/AuthCard";
import VerifyResetOtpForm from "../components/VerifyResetOtpForm";

export default function VerifyResetOtpPage() {
  return (
    <AuthCard
      title="Verify Reset OTP"
      subtitle="Enter the OTP from your email to continue to password reset."
    >
      <Suspense fallback={<p className="text-sm text-stone-300">Loading OTP form...</p>}>
        <VerifyResetOtpForm />
      </Suspense>
    </AuthCard>
  );
}
