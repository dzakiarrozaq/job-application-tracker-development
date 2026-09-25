import { OAUTH_PROVIDERS_ENABLED } from "@/auth";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return <RegisterForm oauth={OAUTH_PROVIDERS_ENABLED} />;
}
