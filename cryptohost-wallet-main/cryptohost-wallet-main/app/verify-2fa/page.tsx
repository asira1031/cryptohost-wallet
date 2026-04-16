"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/client";

type SecurityMethod = "email" | "phone" | "biometric" | null;

export default function Verify2FA() {
  const router = useRouter();

  const [method, setMethod] = useState<SecurityMethod>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const biometricSupported = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      typeof window.PublicKeyCredential !== "undefined"
    );
  }, []);

  useEffect(() => {
    const savedMethod =
      (localStorage.getItem("preferred_2fa_method") as SecurityMethod) || "email";

    setMethod(savedMethod);

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (user?.email) {
        setEmail(user.email);
      }

      const savedPhone = localStorage.getItem("user_phone_number") || "";
      if (savedPhone) {
        setPhone(savedPhone);
      }
    };

    void loadUser();
  }, []);

  const isValidPhone = (num: string) => /^\+[1-9]\d{7,14}$/.test(num);

  async function handleSendCode() {
    try {
      setLoading(true);
      setMessage("");

      if (method === "email") {
        if (!email.trim()) {
          setMessage("No email found for this account.");
          return;
        }

        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: false,
          },
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        setCodeSent(true);
        setMessage("Verification code sent to your email.");
        return;
      }

      if (method === "phone") {
        if (!phone.trim()) {
          setMessage("Enter your phone number first.");
          return;
        }

        if (!isValidPhone(phone.trim())) {
          setMessage("Enter a valid global phone number like +14155552671.");
          return;
        }

        const cleanPhone = phone.trim();
        localStorage.setItem("user_phone_number", cleanPhone);

        const { error } = await supabase.auth.signInWithOtp({
          phone: cleanPhone,
          options: {
            shouldCreateUser: false,
          },
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        setCodeSent(true);
        setMessage("Verification code sent to your phone.");
        return;
      }

      if (method === "biometric") {
        if (!biometricSupported) {
          setMessage("Biometric / passkey is not supported on this device.");
          return;
        }

        setMessage(
          "Biometric / passkey support is detected. Full passkey verification setup is the next step."
        );
        return;
      }

      setMessage("No verification method selected.");
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    try {
      setLoading(true);
      setMessage("");

      if (!code.trim()) {
        setMessage("Enter the verification code.");
        return;
      }

      if (method === "email") {
        if (!email.trim()) {
          setMessage("No email found for this account.");
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: code.trim(),
          type: "email",
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        router.push("/dashboard");
        return;
      }

      if (method === "phone") {
        if (!phone.trim()) {
          setMessage("Enter your phone number first.");
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          phone: phone.trim(),
          token: code.trim(),
          type: "sms",
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        router.push("/dashboard");
        return;
      }

      if (method === "biometric") {
        if (!biometricSupported) {
          setMessage("Biometric / passkey is not supported on this device.");
          return;
        }

        setMessage(
          "Biometric / passkey UI is ready, but full passkey registration and verification still needs backend setup."
        );
        return;
      }

      setMessage("No verification method selected.");
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    router.push("/login");
  }

  function handleChangeMethod() {
    router.push("/dashboard/security");
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <button onClick={handleBack} style={backButtonStyle}>
          ← Back
        </button>

        <h1 style={titleStyle}>Two-Factor Verification</h1>
        <p style={subStyle}>
          Verify your login using your selected security method.
        </p>

        <div style={methodCardStyle}>
          <div style={methodTitleStyle}>Selected Method</div>
          <div style={methodValueStyle}>
            {method === "email" && "Email OTP"}
            {method === "phone" && "Phone OTP"}
            {method === "biometric" && "Biometric / Passkey"}
            {!method && "Not set"}
          </div>
        </div>

        {method === "email" ? (
          <div style={{ marginTop: 18 }}>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
        ) : null}

        {method === "phone" ? (
          <div style={{ marginTop: 18 }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              style={inputStyle}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
            />
          </div>
        ) : null}

        {method !== "biometric" ? (
          <>
            <button
              style={buttonStyle}
              onClick={handleSendCode}
              disabled={loading}
            >
              {loading ? "Please wait..." : "Send Code"}
            </button>

            {codeSent ? (
              <>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="Enter verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />

                <button
                  style={verifyButtonStyle}
                  onClick={handleVerifyCode}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </>
            ) : null}
          </>
        ) : (
          <button
            style={buttonStyle}
            onClick={handleSendCode}
            disabled={loading}
          >
            {loading ? "Checking..." : "Check Biometric Support"}
          </button>
        )}

        {message ? <p style={messageStyle}>{message}</p> : null}

        <button onClick={handleChangeMethod} style={secondaryButtonStyle}>
          Change Verification Method
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

const methodCardStyle: React.CSSProperties = {
  borderRadius: 14,
  background: "#0b1220",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: 14,
};

const methodTitleStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(255,255,255,0.65)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const methodValueStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  color: "rgba(255,255,255,0.75)",
  fontSize: 14,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#0b1220",
  color: "#fff",
  marginTop: 8,
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
  marginBottom: 12,
};

const verifyButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: "#059669",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  marginBottom: 12,
};

const secondaryButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "transparent",
  color: "#93c5fd",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 8,
};

const messageStyle: React.CSSProperties = {
  marginTop: 10,
  marginBottom: 10,
  color: "#c7d2fe",
};