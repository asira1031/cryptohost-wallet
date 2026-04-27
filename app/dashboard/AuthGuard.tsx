"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    }

    checkUser();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#06121f] flex items-center justify-center text-white">
        Checking login...
      </div>
    );
  }

  return <>{children}</>;
}