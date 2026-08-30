import { AuthLayout } from "@/components/auth/auth-layout";
import { RegistrationForm } from "@/components/auth/registration-form";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegistrationForm />
    </AuthLayout>
  );
}
