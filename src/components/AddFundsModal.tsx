"use client";

import { useState } from "react";
import DepositView from "./DepositView";

type Props = {
  onClose: () => void;
};

export default function AddFundsModal({ onClose }: Props) {
  const [view, setView] = useState<"menu" | "deposit">("menu");

  const handleClick = (id: string) => {
    if (id === "deposit") {
      setView("deposit");
    }
  };

  return (
    <div style={{ background: "#000000aa", padding: 20 }}>
      {view === "menu" && (
        <>
          <h2>Deposit</h2>

          <div onClick={() => handleClick("deposit")}>
            Deposit Crypto
          </div>
        </>
      )}

      {view === "deposit" && <DepositView />}

      <button onClick={onClose}>Close</button>
    </div>
  );
}