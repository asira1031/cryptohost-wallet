"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage("Invalid login credentials.");
        return;
      }

     router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={pageStyle}>
      {!showLogin ? (
        <button
          type="button"
          onClick={() => setShowLogin(true)}
          style={logoButtonStyle}
          aria-label="Open login"
        >
          <div style={logoWrapStyle}>
            <img
              src="/cryptohost-logo.jpeg"
              alt="CryptoHost Logo"
              style={logoImageStyle}
            />
          </div>
          <p style={logoTextStyle}>CryptoHost Wallet</p>
          <p style={logoSubTextStyle}>Tap logo to continue</p>
        </button>
      ) : (
        <div style={cardStyle}>
          <button
            type="button"
            onClick={() => setShowLogin(false)}
            style={backButtonStyle}
          >
            ← Back
          </button>

          <h1 style={titleStyle}>CryptoHost Wallet Login</h1>
          <p style={subStyle}>Login to access your wallet dashboard.</p>

          <input
            type="email"
            autoComplete="email"
            style={inputStyle}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            autoComplete="current-password"
            style={inputStyle}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            style={buttonStyle}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {message ? <p style={messageStyle}>{message}</p> : null}

          <button
            type="button"
            onClick={() => router.push("/register")}
            style={signupButtonStyle}
          >
            Sign Up / Create Account
          </button>

          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            style={forgotButtonStyle}
          >
            Forgot password?
          </button>
        </div>
      )}
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

const logoButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const logoWrapStyle: React.CSSProperties = {
  position: "relative",
  width: 140,
  height: 140,
  borderRadius: 24,
  overflow: "hidden",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
};

const logoImageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
};

const logoTextStyle: React.CSSProperties = {
  marginTop: 18,
  marginBottom: 6,
  fontSize: 24,
  fontWeight: 700,
  color: "#ffffff",
};

const logoSubTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "rgba(255,255,255,0.75)",
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

const backButtonStyle: React.CSSProperties = {
  marginBottom: 12,
  background: "transparent",
  border: "none",
  color: "#93c5fd",
  cursor: "pointer",
  padding: 0,
  fontSize: 14,
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
  outline: "none",
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

const signupButtonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 18,
  padding: "11px 14px",
  borderRadius: 12,
  border: "1px solid rgba(147,197,253,0.45)",
  background: "rgba(37,99,235,0.25)",
  color: "#bfdbfe",
  fontWeight: 700,
  cursor: "pointer",
};

const forgotButtonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 10,
  background: "transparent",
  border: "none",
  color: "#93c5fd",
  cursor: "pointer",
  fontSize: 14,
};

const messageStyle: React.CSSProperties = {
  marginTop: 14,
  color: "#c7d2fe",
};