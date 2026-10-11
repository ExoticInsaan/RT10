"use client";

import { useAuth } from "@/components/AuthProvider";
import Button from "@/components/ui/Button";

export default function HeaderAuth() {
  const { user, ready, openSignIn, signOut } = useAuth();

  if (ready && user) {
    return (
      <Button variant="secondary" onClick={signOut}>
        Logout
      </Button>
    );
  }
  return <Button onClick={openSignIn}>Login</Button>;
}
