"use client";  

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage("Reset session not found. Please request a new password reset link.");
      } else {
        setReady(true);
      }
    };

    checkSession();
  }, []);

  async function handleUpdatePassword() {
    if (!password || !confirmPassword) {
      setMessage("Please complete both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully. Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    }

    setLoading(false);
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Reset Password</h1>
        <p style={subStyle}>Enter your new password below.</p>

        <input
          type="password"
          style={inputStyle}
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!ready || loading}
        />

        <input
          type="password"
          style={inputStyle}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={!ready || loading}
        />

        <button
          style={{
            ...buttonStyle,
            opacity: !ready || loading ? 0.7 : 1,
            cursor: !ready || loading ? "not-allowed" : "pointer",
          }}
          onClick={handleUpdatePassword}
          disabled={!ready || loading}
        >
          {loading ? "Updating..." : "Update Password"}
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
};

const messageStyle: React.CSSProperties = {
  marginTop: 14,
  color: "#c7d2fe",
};