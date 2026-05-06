"use client";

import { useState } from "react";
import AddFundsModal from "../../components/AddFundsModal";

export default function WalletTestPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: 20 }}>
      <h1>Wallet Test (Safe)</h1>

      <button onClick={() => setShowModal(true)}>
        Add Funds
      </button>

      {showModal && (
        <AddFundsModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}