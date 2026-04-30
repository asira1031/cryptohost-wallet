"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const adminEmail = localStorage.getItem("user_email");

    if (adminEmail === "cryptowallet@asiracryptohost.co.uk") {
      setAllowed(true);
    } else {
      router.push("/dashboard");
    }
  }, [router]);

  if (!allowed) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Checking access...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold">Admin Orders Locked Area 🔒</h1>
      <p className="mt-4 text-zinc-400">
        Only authorized CryptoHost admin can access this page.
      </p>
    </div>
  );
}