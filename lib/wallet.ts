export function loadEvmWallet() {
  if (typeof window === "undefined") return null;

  const address = localStorage.getItem("evm_address");
  const privateKey = localStorage.getItem("privateKey");

  if (!address) return null;

  return {
    address,
    privateKey,
  };
}