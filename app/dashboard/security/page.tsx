"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getEncryptedWalletAddress,
  hasEncryptedWallet,
  unlockEncryptedWallet,
} from "@/app/lib/wallet-security";

type SecurityMethod = "email" | "phone" | "biometric";

export default function SecurityPage() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<SecurityMethod | null>(null);

  const [walletAddress, setWalletAddress] = useState("");
  const [walletPassword, setWalletPassword] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const biometricSupported = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      typeof window.PublicKeyCredential !== "undefined"
    );
  }, []);

  useEffect(() => {
    const savedMethod = localStorage.getItem(
      "preferred_2fa_method"
    ) as SecurityMethod | null;

    if (savedMethod) {
      setSelectedMethod(savedMethod);
    }

    if (hasEncryptedWallet()) {
      const address = getEncryptedWalletAddress();
      if (address) {
        setWalletAddress(address);
      }
    }
  }, []);

  function copyToClipboard(value: string) {
    if (typeof window === "undefined" || !value) return;

    const fallbackCopy = () => {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        alert("Copied!");
      } catch (err) {
        console.error("Copy failed:", err);
        alert("Copy failed.");
      } finally {
        document.body.removeChild(textArea);
      }
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(() => {
        alert("Copied!");
      }).catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  }

  function shortenAddress(address?: string) {
    if (!address) return "No wallet";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function saveMethod(method: SecurityMethod) {
    try {
      localStorage.setItem("2fa_enabled", "true");
      localStorage.setItem("preferred_2fa_method", method);
      setSelectedMethod(method);

      if (method === "biometric" && !biometricSupported) {
        setMessage("Biometric / passkey is not available on this device or browser.");
        return;
      }

      setMessage(`Security method saved: ${method.toUpperCase()}`);
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

  async function handleRevealSecrets() {
    try {
      setMessage("");
      setUnlocking(true);

      const cleanPassword = walletPassword.trim();
      if (!cleanPassword) {
        setMessage("Enter wallet password to reveal private key and recovery phrase.");
        return;
      }

      const unlocked = await unlockEncryptedWallet(cleanPassword);

      setPrivateKey(unlocked.privateKey || "");
      setMnemonic((unlocked as any).mnemonic || "");
      setShowSecrets(true);
      setWalletPassword("");
      setMessage("Backup details revealed.");
    } catch (error) {
      console.error(error);
      setShowSecrets(false);
      setPrivateKey("");
      setMnemonic("");
      setMessage("Unable to unlock wallet backup details. Check your wallet password.");
    } finally {
      setUnlocking(false);
    }
  }

  function handleHideSecrets() {
    setShowSecrets(false);
    setPrivateKey("");
    setMnemonic("");
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
              onClick={() => saveMethod("email")}
              className="w-full rounded-xl border border-white/10 bg-[#0a1730] px-4 py-4 text-left transition hover:bg-[#102042]"
            >
              <div className="text-base font-semibold text-white">Email OTP</div>
              <div className="mt-1 text-sm text-gray-400">
                Receive a one-time verification code in your email.
              </div>
            </button>

            <button
              type="button"
              onClick={() => saveMethod("phone")}
              className="w-full rounded-xl border border-white/10 bg-[#0a1730] px-4 py-4 text-left transition hover:bg-[#102042]"
            >
              <div className="text-base font-semibold text-white">Phone OTP</div>
              <div className="mt-1 text-sm text-gray-400">
                Receive a one-time verification code by SMS using your global phone number.
              </div>
            </button>

            <button
              type="button"
              onClick={() => saveMethod("biometric")}
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
              Selected method:{" "}
              <span className="font-semibold uppercase">{selectedMethod}</span>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-white/10 bg-[#0a1730] p-4 text-sm text-white/85">
              No security method selected yet.
            </div>
          )}

          <button
            type="button"
            onClick={disable2FA}
            className="mt-5 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Clear Security Preference
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6">
          <h2 className="mb-3 text-xl font-medium text-yellow-200">
            Backup & Recovery
          </h2>

          <p className="mb-4 text-sm text-yellow-100/85">
            Reveal your private key and recovery phrase only when you are ready to back them up safely.
          </p>

          <div className="mb-4 rounded-xl border border-white/10 bg-[#0a1730] p-4 text-sm text-white/85">
            Wallet:{" "}
            <span className="font-semibold">
              {walletAddress ? shortenAddress(walletAddress) : "No wallet found"}
            </span>
          </div>

          {!showSecrets ? (
            <>
              <input
                type="password"
                value={walletPassword}
                onChange={(e) => setWalletPassword(e.target.value)}
                placeholder="Enter wallet password"
                className="w-full rounded-xl border border-white/10 bg-[#0a1730] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
              />

              <button
                type="button"
                onClick={handleRevealSecrets}
                disabled={unlocking || !walletAddress}
                className="mt-4 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {unlocking ? "Revealing..." : "Reveal Backup Details"}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-[#0a1730] p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-white/45">
                  Private Key
                </p>
                <p className="break-all text-sm text-white/90">
                  {privateKey || "No private key available"}
                </p>

                {privateKey ? (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(privateKey)}
                    className="mt-3 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white"
                  >
                    Copy Private Key
                  </button>
                ) : null}
              </div>

              <div className="rounded-xl border border-white/10 bg-[#0a1730] p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-white/45">
                  Recovery Phrase
                </p>
                <p className="break-words text-sm text-white/90">
                  {mnemonic || "No recovery phrase saved for this wallet"}
                </p>

                {mnemonic ? (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(mnemonic)}
                    className="mt-3 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white"
                  >
                    Copy Recovery Phrase
                  </button>
                ) : null}
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-200">
                Never share your private key or recovery phrase. Store them offline in a secure place.
              </div>

              <button
                type="button"
                onClick={handleHideSecrets}
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Hide Backup Details
              </button>
            </div>
          )}
        </div>

        {message ? (
          <div className="mt-6 rounded-xl border border-white/10 bg-[#0a1730] p-4 text-sm text-white/85">
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}