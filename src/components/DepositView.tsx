"use client";

import QRCode from "react-qr-code";

export default function DepositView() {
  const address =
    typeof window !== "undefined"
      ? localStorage.getItem("evm_address")
      : "";

  return (
    <div>
      <h3>Deposit Crypto</h3>

      <p>{address}</p>

      {address && <QRCode value={address} />}
    </div>
  );
}