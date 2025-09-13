import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm mt-16 p-6 text-neutral-400">Chargement…</div>}>
      <LoginForm />
    </Suspense>
  );
}
