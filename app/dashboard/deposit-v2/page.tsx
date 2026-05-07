export default function DepositV2Page() {
  return (
    <div
      style={{
        padding: 20,
        color: "white",
        minHeight: "100vh",
        background: "#0b0f19",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        CryptoHost Deposit V2
      </h1>

      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Sandbox funding system
      </p>

      <div style={{ marginTop: 30 }}>
        <button
          style={{
            width: "100%",
            padding: 16,
            marginBottom: 12,
            borderRadius: 12,
            border: "none",
            background: "#1f2937",
            color: "white",
            cursor: "pointer",
          }}
        >
          Deposit Crypto
        </button>

        <button
          style={{
            width: "100%",
            padding: 16,
            marginBottom: 12,
            borderRadius: 12,
            border: "none",
            background: "#1f2937",
            color: "white",
            cursor: "pointer",
          }}
        >
          Buy with Card
        </button>

        <button
          style={{
            width: "100%",
            padding: 16,
            marginBottom: 12,
            borderRadius: 12,
            border: "none",
            background: "#1f2937",
            color: "white",
            cursor: "pointer",
          }}
        >
          Fiat Deposit
        </button>

        <button
          style={{
            width: "100%",
            padding: 16,
            borderRadius: 12,
            border: "none",
            background: "#1f2937",
            color: "white",
            cursor: "pointer",
          }}
        >
          P2P Trading
        </button>
      </div>
    </div>
  );
}