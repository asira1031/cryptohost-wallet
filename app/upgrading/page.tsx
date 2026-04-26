export default function UpgradingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#06141f",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "20px",
          padding: "28px",
          background: "rgba(255,255,255,0.06)",
        }}
      >
        <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>
          CryptoHost Wallet Upgrade
        </h1>

        <p style={{ fontSize: "16px", lineHeight: "1.6", opacity: 0.9 }}>
          Our wallet system is currently undergoing a security upgrade.
          Sending, receiving, and wallet access are temporarily unavailable.
        </p>

        <p style={{ marginTop: "18px", fontSize: "14px", opacity: 0.7 }}>
          Please check back shortly. Thank you for your patience.
        </p>
      </div>
    </main>
  );
}