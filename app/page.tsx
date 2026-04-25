"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#03113a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        cursor: "pointer",
      }}
      onClick={() => router.push("/login")}
    >
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: 24,
          overflow: "hidden",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
        }}
      >
        <img
          src="/cryptohost-logo.jpeg"
          alt="CryptoHost Logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      <h1
        style={{
          marginTop: 20,
          color: "#fff",
          fontSize: 24,
        }}
      >
        CryptoHost Wallet
      </h1>

      <p style={{ color: "#aaa", marginTop: 6 }}>
        Tap anywhere to continue
      </p>
    </main>
  );
}