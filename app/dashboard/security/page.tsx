"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadEvmWallet, saveEvmWallet } from "../../lib/wallet/evmWallet";
import {
  getEncryptedWalletAddress,
  hasEncryptedWallet,
  unlockEncryptedWallet,
} from "../../lib/wallet-security";
import { supabase } from "../../lib/supabase/client";

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

  const [importPrivateKey, setImportPrivateKey] = useState("");

  const biometricSupported = useMemo(() => {
    return typeof window !== "undefined" && typeof window.PublicKeyCredential !== "undefined";
  }, []);

  useEffect(() => {
    const savedMethod = localStorage.getItem("preferred_2fa_method") as SecurityMethod | null;
    if (savedMethod) setSelectedMethod(savedMethod);

    const localWallet = loadEvmWallet();

    if (localWallet?.address) {
      setWalletAddress(localWallet.address);
      return;
    }

    if (hasEncryptedWallet()) {
      const address = getEncryptedWalletAddress();
      if (address) setWalletAddress(address);
    }
  }, []);

  function shortenAddress(address?: string) {
    if (!address) return "No wallet";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function saveMethod(method: SecurityMethod) {
    localStorage.setItem("preferred_2fa_method", method);
    setSelectedMethod(method);

    if (method === "biometric" && !biometricSupported) {
      setMessage("Biometric not supported.");
      return;
    }

    setMessage(`Security method set: ${method.toUpperCase()}`);
  }

  function handleImportWallet() {
    try {
      let cleanKey = importPrivateKey.trim();

      if (!cleanKey) {
        setMessage("Enter private key.");
        return;
      }

      if (!cleanKey.startsWith("0x")) {
        cleanKey = "0x" + cleanKey;
      }

      const savedWallet = saveEvmWallet({ privateKey: cleanKey });

      setWalletAddress(savedWallet.address);
      setImportPrivateKey("");
      setMessage("Wallet imported successfully.");
    } catch {
      setMessage("Invalid private key.");
    }
  }

  async function handleRevealSecrets() {
    try {
      setUnlocking(true);

      if (!walletPassword.trim()) {
        setMessage("Enter wallet password.");
        return;
      }

      const unlocked = await unlockEncryptedWallet(walletPassword.trim());

      setPrivateKey(unlocked.privateKey || "");
      setMnemonic((unlocked as any).mnemonic || "");
      setShowSecrets(true);
      setWalletPassword("");
    } catch {
      setMessage("Wrong wallet password.");
    } finally {
      setUnlocking(false);
    }
  }

  function handleHideSecrets() {
    setShowSecrets(false);
    setPrivateKey("");
    setMnemonic("");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#06121f] px-6 py-10 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-cyan-900/40 bg-[#071b2b] p-8 shadow-xl">

        <h1 className="mb-6 text-2xl font-semibold">Security</h1>

        {/* 🔐 SECURITY METHOD */}
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-medium">Security Method</h2>

          <div className="space-y-3">
            <button onClick={() => saveMethod("email")} className="w-full rounded-xl bg-[#0a1730] p-3 text-left hover:bg-[#122347]">
              Email OTP
            </button>

            <button onClick={() => saveMethod("phone")} className="w-full rounded-xl bg-[#0a1730] p-3 text-left hover:bg-[#122347]">
              Phone OTP
            </button>

            <button onClick={() => saveMethod("biometric")} className="w-full rounded-xl bg-[#0a1730] p-3 text-left hover:bg-[#122347]">
              Biometric
            </button>
          </div>

          <p className="mt-4 text-sm text-emerald-300">
            Selected: {selectedMethod || "None"}
          </p>
        </div>

        {/* 💼 IMPORT WALLET */}
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-medium">Import Wallet</h2>

          <input
            type="password"
            value={importPrivateKey}
            onChange={(e) => setImportPrivateKey(e.target.value)}
            placeholder="Paste private key"
            className="w-full rounded-xl bg-[#0a1730] p-3 text-white"
          />

          <button onClick={handleImportWallet} className="mt-3 w-full rounded-xl bg-emerald-500 p-3">
            Import Wallet
          </button>

          <p className="mt-3 text-sm text-gray-300">
            Wallet: {shortenAddress(walletAddress)}
          </p>
        </div>

        {/* 🔑 BACKUP */}
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-medium">Backup</h2>

          {!showSecrets ? (
            <>
              <input
                type="password"
                value={walletPassword}
                onChange={(e) => setWalletPassword(e.target.value)}
                placeholder="Wallet password"
                className="w-full rounded-xl bg-[#0a1730] p-3 text-white"
              />

              <button onClick={handleRevealSecrets} className="mt-3 w-full rounded-xl bg-yellow-500 p-3">
                Reveal Backup
              </button>
            </>
          ) : (
            <>
              <p className="break-all text-xs">Private Key: {privateKey}</p>
              <p className="break-all text-xs mt-2">Mnemonic: {mnemonic}</p>

              <button onClick={handleHideSecrets} className="mt-3 w-full rounded-xl bg-gray-600 p-3">
                Hide
              </button>
            </>
          )}
        </div>

        {/* MESSAGE */}
        {message && <p className="mb-4 text-sm text-yellow-300">{message}</p>}

        {/* LOGOUT */}
        <button onClick={handleLogout} className="w-full rounded-xl bg-red-500 p-3">
          Logout
        </button>
      </div>
    </div>
  );
}