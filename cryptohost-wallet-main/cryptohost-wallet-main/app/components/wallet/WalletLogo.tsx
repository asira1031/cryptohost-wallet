export default function WalletLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg">
        <img
          src="/cryptohost-logo.jpeg"
          alt="CryptoHost Wallet"
          className="h-full w-full object-contain p-2"
        />
      </div>

      <div>
        <div className="text-sm uppercase tracking-[0.25em] text-blue-300/80">
          Secure Wallet
        </div>
        <div className="text-xl font-semibold text-white">
          CryptoHost Wallet
        </div>
      </div>
    </div>
  );
}