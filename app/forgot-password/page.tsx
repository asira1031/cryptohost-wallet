"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleResetRequest() {
    setLoading(true);
    setMessage("");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setMessage("Supabase environment variables are missing.");
      setLoading(false);
      return;
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password reset link sent. Check your email.");
    }

    setLoading(false);
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Forgot Password</h1>
        <p style={subStyle}>Enter your email to receive a reset link.</p>

        <input
          style={inputStyle}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          style={buttonStyle}
          onClick={handleResetRequest}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message ? <p style={messageStyle}>{message}</p> : null}
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

const messageStyle: React.CSSProperties = {
  marginTop: 14,
  color: "#c7d2fe",
};