"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadEvmWallet,
  saveEvmWallet,
} from "../../lib/wallet/evmWallet";
import {
  getEncryptedWalletAddress,
  hasEncryptedWallet,
  unlockEncryptedWallet,
} from "../../lib/wallet-security";
import { supabase } from "../../lib/supabase/client";

export default function SecurityPage() {
  const router = useRouter();

  const [message, setMessage] =
    useState("");

  const [walletAddress, setWalletAddress] =
    useState("");

  const [walletPassword, setWalletPassword] =
    useState("");

  const [privateKey, setPrivateKey] =
    useState("");

  const [mnemonic, setMnemonic] =
    useState("");

  const [showSecrets, setShowSecrets] =
    useState(false);

  const [unlocking, setUnlocking] =
    useState(false);

  const [importPrivateKey, setImportPrivateKey] =
    useState("");

  const [mainWallet, setMainWallet] =
    useState("");

  const [importedWallet, setImportedWallet] =
    useState("");

  const [activeWallet, setActiveWallet] =
    useState<"main" | "imported">(
      "main"
    );

  useEffect(() => {
    const savedActive =
      localStorage.getItem(
        "active_wallet"
      ) as
        | "main"
        | "imported"
        | null;

    const savedImported =
      localStorage.getItem(
        "imported_wallet_address"
      );

    if (savedActive) {
      setActiveWallet(
        savedActive
      );
    }

    if (savedImported) {
      setImportedWallet(
        savedImported
      );
    }

    const localWallet =
      loadEvmWallet();

    if (
      savedActive ===
        "imported" &&
      savedImported
    ) {
      setWalletAddress(
        savedImported
      );

      setMainWallet(
        localWallet?.address ||
          ""
      );
    } else if (
      localWallet?.address
    ) {
      setWalletAddress(
        localWallet.address
      );

      setMainWallet(
        localWallet.address
      );
    }

    if (
      hasEncryptedWallet()
    ) {
      const address =
        getEncryptedWalletAddress();

      if (
        address &&
        savedActive !==
          "imported"
      ) {
        setWalletAddress(
          address
        );

        setMainWallet(
          address
        );
      }
    }
  }, []);

  function shortenAddress(
    address?: string
  ) {
    if (!address)
      return "No wallet";

    return `${address.slice(
      0,
      6
    )}...${address.slice(-4)}`;
  }

  function handleImportWallet() {
    try {
      let cleanKey =
        importPrivateKey.trim();

      if (!cleanKey) {
        setMessage(
          "Enter private key."
        );
        return;
      }

      if (
        !cleanKey.startsWith(
          "0x"
        )
      ) {
        cleanKey =
          "0x" + cleanKey;
      }

      const savedWallet =
        saveEvmWallet({
          privateKey:
            cleanKey,
        });

      setWalletAddress(
        savedWallet.address
      );

      setImportedWallet(
        savedWallet.address
      );

      setActiveWallet(
        "imported"
      );

      localStorage.setItem(
        "imported_wallet_address",
        savedWallet.address
      );

      localStorage.setItem(
        "active_wallet",
        "imported"
      );

      setImportPrivateKey(
        ""
      );

      setMessage(
        "Wallet imported successfully."
      );
    } catch {
      setMessage(
        "Invalid private key."
      );
    }
  }

  async function handleRevealSecrets() {
    try {
      setUnlocking(true);

      if (
        !walletPassword.trim()
      ) {
        setMessage(
          "Enter wallet password."
        );
        return;
      }

      const unlocked =
        await unlockEncryptedWallet(
          walletPassword.trim()
        );

      setPrivateKey(
        unlocked.privateKey ||
          ""
      );

      setMnemonic(
        (unlocked as any)
          .mnemonic ||
          ""
      );

      setShowSecrets(
        true
      );

      setWalletPassword(
        ""
      );
    } catch {
      setMessage(
        "Wrong wallet password."
      );
    } finally {
      setUnlocking(
        false
      );
    }
  }

  function handleHideSecrets() {
    setShowSecrets(
      false
    );

    setPrivateKey("");

    setMnemonic("");
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push(
      "/login"
    );
  }

  return (
    <div className="min-h-screen bg-black px-5 py-8 text-white">
      <div className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-[#0d0d0d] p-5 shadow-2xl">

        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-amber-400">
            Security
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="rounded-2xl bg-[#1a1a1a] px-4 py-2 text-sm font-semibold"
          >
            Back
          </button>
        </div>

        <div className="mb-5 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 p-5 text-black">
          <p className="text-sm font-medium">
            Active Wallet
          </p>

          <p className="mt-3 text-xs break-all">
            {walletAddress ||
              "No wallet connected"}
          </p>
        </div>

        <div className="mb-5 rounded-2xl bg-[#111] p-4">
          <p className="mb-3 text-sm font-semibold text-zinc-300">
            Wallet Import
          </p>

          <input
            type="password"
            value={
              importPrivateKey
            }
            onChange={(e) =>
              setImportPrivateKey(
                e.target.value
              )
            }
            placeholder="Paste private key"
            className="w-full rounded-2xl bg-[#141414] p-3 outline-none"
          />

          <button
            type="button"
            onClick={
              handleImportWallet
            }
            className="mt-3 w-full rounded-2xl bg-emerald-500 p-3 font-semibold text-black"
          >
            Import Wallet
          </button>

          <p className="mt-3 text-xs text-white/60">
            Wallet:{" "}
            {shortenAddress(
              walletAddress
            )}
          </p>
        </div>

        {importedWallet && (
          <div className="mb-5 rounded-2xl bg-[#111] p-4">
            <p className="mb-3 text-sm font-semibold text-zinc-300">
              Choose Wallet
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveWallet(
                    "main"
                  );

                  setWalletAddress(
                    mainWallet
                  );

                  localStorage.setItem(
                    "active_wallet",
                    "main"
                  );
                }}
                className={`rounded-xl py-3 text-sm font-semibold ${
                  activeWallet ===
                  "main"
                    ? "bg-[#f7a600] text-black"
                    : "bg-[#222]"
                }`}
              >
                Original
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveWallet(
                    "imported"
                  );

                  setWalletAddress(
                    importedWallet
                  );

                  localStorage.setItem(
                    "active_wallet",
                    "imported"
                  );
                }}
                className={`rounded-xl py-3 text-sm font-semibold ${
                  activeWallet ===
                  "imported"
                    ? "bg-[#f7a600] text-black"
                    : "bg-[#222]"
                }`}
              >
                Imported
              </button>
            </div>
          </div>
        )}

        <div className="mb-5 rounded-2xl bg-[#111] p-4">
          <p className="mb-3 text-sm font-semibold text-zinc-300">
            Backup Recovery
          </p>

          {!showSecrets ? (
            <>
              <input
                type="password"
                value={
                  walletPassword
                }
                onChange={(e) =>
                  setWalletPassword(
                    e.target.value
                  )
                }
                placeholder="Wallet password"
                className="w-full rounded-2xl bg-[#141414] p-3 outline-none"
              />

              <button
                type="button"
                onClick={
                  handleRevealSecrets
                }
                disabled={
                  unlocking
                }
                className="mt-3 w-full rounded-2xl bg-[#f7a600] p-3 font-semibold text-black"
              >
                {unlocking
                  ? "Loading..."
                  : "Reveal Backup"}
              </button>
            </>
          ) : (
            <>
              <p className="break-all text-xs">
                Private Key:{" "}
                {privateKey}
              </p>

              <p className="mt-3 break-all text-xs">
                Mnemonic:{" "}
                {mnemonic}
              </p>

              <button
                type="button"
                onClick={
                  handleHideSecrets
                }
                className="mt-3 w-full rounded-2xl bg-gray-600 p-3 font-semibold"
              >
                Hide
              </button>
            </>
          )}
        </div>

        <div className="mb-5 rounded-2xl bg-[#111] p-4">
          <p className="mb-3 text-sm font-semibold text-zinc-300">
            Device Security
          </p>

          <button
            type="button"
            className="mb-3 w-full rounded-2xl bg-[#1a1a1a] p-3 font-semibold"
          >
            Active Session
          </button>

          <button
            type="button"
            className="w-full rounded-2xl bg-[#1a1a1a] p-3 font-semibold"
          >
            Logout All Devices
          </button>
        </div>

        {message && (
          <p className="mb-4 text-center text-sm text-green-400">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={
            handleLogout
          }
          className="w-full rounded-2xl bg-red-500 p-3 font-semibold text-white"
        >
          Logout
        </button>

      </div>
    </div>
  );
}