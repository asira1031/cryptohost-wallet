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
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            marginBottom: "12px",
            fontWeight: "700",
          }}
        >
          🚀 CryptoHost Send Upgrade
        </h1>

        <p
          style={{
            fontSize: "16px",
            lineHeight: "1.6",
            opacity: 0.92,
            marginBottom: "14px",
          }}
        >
          Our Send feature is currently undergoing active upgrades to improve
          transaction reliability, wallet performance, and user security.
        </p>

        <p
          style={{
            fontSize: "15px",
            lineHeight: "1.6",
            opacity: 0.82,
          }}
        >
          Wallet balances remain safe. Service will return shortly.
        </p>

        <p
          style={{
            marginTop: "18px",
            fontSize: "14px",
            opacity: 0.65,
          }}
        >
          Thank you for your patience and continued support.
        </p>
      </div>
    </main>
  );
}