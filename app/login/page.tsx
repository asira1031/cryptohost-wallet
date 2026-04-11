"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      router.push("/dashboard");
    }

    setLoading(false);
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>CryptoHost Wallet Login</h1>
        <p style={subStyle}>Access your secure wallet dashboard.</p>

        <input
          style={inputStyle}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          style={inputStyle}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={buttonStyle} onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {message ? <p style={messageStyle}>{message}</p> : null}

        <div style={{ marginTop: 18, display: "grid", gap: 8 }}>
          <Link href="/register" style={linkStyle}>
            Create account
          </Link>
          <Link href="/reset-password" style={linkStyle}>
            Forgot password?
          </Link>
        </div>
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#03113a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 440,
  background: "#13205a",
  borderRadius: 20,
  padding: 28,
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.08)",
};

const titleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 8,
};

const subStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.75)",
  marginBottom: 20,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#0b1220",
  color: "#fff",
  marginBottom: 14,
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const linkStyle: React.CSSProperties = {
  color: "#93c5fd",
  textDecoration: "none",
  fontSize: 14,
};

const messageStyle: React.CSSProperties = {
  marginTop: 14,
  color: "#c7d2fe",
};