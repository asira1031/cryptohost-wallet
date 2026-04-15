"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verify } from "otplib";

export default function Verify2FA() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  async function handleVerify() {
    const secret = localStorage.getItem("2fa_secret");

    if (!secret) {
      setMessage("No 2FA setup found.");
      return;
    }

    const result = await verify({
      token: code,
      secret,
    });

    if (result.valid) {
      router.push("/dashboard");
    } else {
      setMessage("Invalid code.");
    }
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>Enter Authenticator Code</h2>

      <input
        type="text"
        placeholder="6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: 10,
          marginTop: 12,
          marginBottom: 12,
        }}
      />

      <button onClick={handleVerify}>Verify</button>

      {message && <p>{message}</p>}
    </div>
  );
}
