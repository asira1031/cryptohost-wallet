"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type SecurityMethod = "email" | "phone" | "biometric";

export default function SecurityPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<SecurityMethod | null>(null);

  const biometricSupported = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      typeof window.PublicKeyCredential !== "undefined"
    );
  }, []);

  function saveMethodAndContinue(method: SecurityMethod) {
    try {
      localStorage.setItem("2fa_enabled", "true");
      localStorage.setItem("preferred_2fa_method", method);
      setSelectedMethod(method);

      if (method === "biometric" && !biometricSupported) {
        setMessage("Biometric / passkey is not available on this device or browser.");
        return;
      }

      router.push("/verify-2fa");
    } catch (error) {
      console.error(error);
      setMessage("Unable to save security preference.");
    }
  }

  function disable2FA() {
    localStorage.removeItem("2fa_enabled");
    localStorage.removeItem("preferred_2fa_method");
    setSelectedMethod(null);
    setMessage("2FA preference cleared.");
  }

  return (
    <div className="min-h-screen bg-[#06121f] px-6 py-10 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-cyan-900/40 bg-[#071b2b] p-8 shadow-2xl">
        <h1 className="mb-6 text-2xl font-semibold">Security</h1>

        <div className="rounded-2xl border border-cyan-800/30 bg-[#082235] p-6">
          <h2 className="mb-4 text-xl font-medium">Security Verification</h2>

          <p className="mb-6 text-sm text-gray-300">
            Choose your preferred verification method for account protection and transaction approval.
          </p>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => saveMethodAndContinue("email")}
              className="w-full rounded-xl border border-white/10 bg-[#0a1730] px-4 py-4 text-left transition hover:bg-[#102042]"
            >
              <div className="text-base font-semibold text-white">Email OTP</div>
              <div className="mt-1 text-sm text-gray-400">
                Receive a one-time verification code in your email.
              </div>
            </button>

            <button
              type="button"
              onClick={() => saveMethodAndContinue("phone")}
              className="w-full rounded-xl border border-white/10 bg-[#0a1730] px-4 py-4 text-left transition hover:bg-[#102042]"
            >
              <div className="text-base font-semibold text-white">Phone OTP</div>
              <div className="mt-1 text-sm text-gray-400">
                Receive a one-time verification code by SMS using your global phone number.
              </div>
            </button>

            <button
              type="button"
              onClick={() => saveMethodAndContinue("biometric")}
              className="w-full rounded-xl border border-white/10 bg-[#0a1730] px-4 py-4 text-left transition hover:bg-[#102042] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!biometricSupported}
            >
              <div className="text-base font-semibold text-white">
                Biometric / Passkey
              </div>
              <div className="mt-1 text-sm text-gray-400">
                Use Face ID, fingerprint, or device passkey if supported.
              </div>
            </button>

            <div className="w-full rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-4 text-left">
              <div className="text-base font-semibold text-yellow-300">
                Authenticator
              </div>
              <div className="mt-1 text-sm text-yellow-200/90">
                Temporarily disabled. Please use Email OTP, Phone OTP, or Biometric.
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
            Your wallet security is handled through your selected verification method.
          </div>

          {selectedMethod ? (
            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              Selected method: <span className="font-semibold uppercase">{selectedMethod}</span>
            </div>
          ) : null}

          {message ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-[#0a1730] p-4 text-sm text-white/85">
              {message}
            </div>
          ) : null}

          <button
            type="button"
            onClick={disable2FA}
            className="mt-5 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Clear Security Preference
          </button>
        </div>
      </div>
    </div>
  );
}