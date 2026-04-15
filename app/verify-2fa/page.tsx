"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function Verify2FA() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loadingAction, setLoadingAction] = useState<"" | "email" | "phone" | "biometric">("");

  const biometricSupported = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      !!window.PublicKeyCredential
    );
  }, []);

  async function handleEmailOtp() {
    try {
      setLoadingAction("email");
      setMessage("");

      localStorage.setItem("preferred_2fa_method", "email");
      router.push("/dashboard/security");
    } catch (error) {
      console.error(error);
      setMessage("Unable to continue with Email OTP.");
    } finally {
      setLoadingAction("");
    }
  }

  async function handlePhoneOtp() {
    try {
      setLoadingAction("phone");
      setMessage("");

      localStorage.setItem("preferred_2fa_method", "phone");
      router.push("/dashboard/security");
    } catch (error) {
      console.error(error);
      setMessage("Unable to continue with Phone OTP.");
    } finally {
      setLoadingAction("");
    }
  }

  async function handleBiometric() {
    try {
      setLoadingAction("biometric");
      setMessage("");

      if (!biometricSupported) {
        setMessage("Biometric / passkey is not available on this device or browser.");
        return;
      }

      localStorage.setItem("preferred_2fa_method", "biometric");
      router.push("/dashboard/security");
    } catch (error) {
      console.error(error);
      setMessage("Unable to continue with biometric verification.");
    } finally {
      setLoadingAction("");
    }
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Choose Verification Method</h1>
        <p style={subStyle}>
          Select how you want to verify your login and secure wallet actions.
        </p>

        <button
          type="button"
          onClick={handleEmailOtp}
          disabled={loadingAction !== ""}
          style={optionButtonStyle}
        >
          <div style={optionTitleStyle}>Email OTP</div>
          <div style={optionSubStyle}>
            Receive a one-time verification code in your email.
          </div>
        </button>

        <button
          type="button"
          onClick={handlePhoneOtp}
          disabled={loadingAction !== ""}
          style={optionButtonStyle}
        >
          <div style={optionTitleStyle}>Phone OTP</div>
          <div style={optionSubStyle}>
            Receive a one-time verification code by SMS.
          </div>
        </button>

        <button
          type="button"
          onClick={handleBiometric}
          disabled={loadingAction !== ""}
          style={{
            ...optionButtonStyle,
            opacity: biometricSupported ? 1 : 0.65,
          }}
        >
          <div style={optionTitleStyle}>Biometric / Passkey</div>
          <div style={optionSubStyle}>
            Use Face ID, fingerprint, or device passkey if supported.
          </div>
        </button>

        {!biometricSupported ? (
          <p style={hintStyle}>
            Biometric / passkey is not available on this device or browser yet.
          </p>
        ) : null}

        {message ? <p style={messageStyle}>{message}</p> : null}

        <button
          type="button"
          onClick={() => router.push("/login")}
          style={backButtonStyle}
        >
          ← Back to Login
        </button>
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
  boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
};

const titleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 8,
};

const subStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.75)",
  marginBottom: 20,
  lineHeight: 1.5,
};

const optionButtonStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "16px 18px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#0b1220",
  color: "#fff",
  marginBottom: 14,
  cursor: "pointer",
};

const optionTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  marginBottom: 6,
};

const optionSubStyle: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(255,255,255,0.72)",
};

const hintStyle: React.CSSProperties = {
  marginTop: 2,
  marginBottom: 14,
  fontSize: 13,
  color: "#fde68a",
};

const backButtonStyle: React.CSSProperties = {
  marginTop: 8,
  background: "transparent",
  border: "none",
  color: "#93c5fd",
  cursor: "pointer",
  padding: 0,
  fontSize: 14,
};

const messageStyle: React.CSSProperties = {
  marginTop: 14,
  color: "#c7d2fe",
};