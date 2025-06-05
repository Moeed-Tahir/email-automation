import { Suspense } from 'react';
import SignupFlow from "@/components/Signup";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupFlow />
    </Suspense>
  );
}