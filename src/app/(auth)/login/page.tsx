import { Suspense } from "react";
import { OAUTH_PROVIDERS_ENABLED } from "@/auth";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm oauth={OAUTH_PROVIDERS_ENABLED} />
    </Suspense>
  );
}
