"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase/client";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!username || !email || !password || !confirmPassword) {
      setMessage("Please complete all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://cryptohost-wallet-dw3e.vercel.app/login",
        data: {
          username,
        },
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      if (data.user && data.session) {
        setMessage("Registration successful. You can now log in.");
      } else {
        setMessage("Registration successful. Check your email to confirm.");
      }
    }

    setLoading(false);
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Create CryptoHost Wallet Account</h1>
        <p style={subStyle}>Sign up to access your wallet dashboard.</p>

        <input
          style={inputStyle}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

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

        <input
          type="password"
          style={inputStyle}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button style={buttonStyle} onClick={handleRegister} disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>

        {message ? <p style={messageStyle}>{message}</p> : null}

        <div style={{ marginTop: 18 }}>
          <Link href="/login" style={linkStyle}>
            Already have an account? Login
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
  maxWidth: 460,
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