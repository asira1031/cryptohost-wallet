import { TronWeb } from "tronweb";

const TRON_FULL_HOST =
  process.env.NEXT_PUBLIC_TRON_FULL_HOST || "https://api.trongrid.io";

export function getTronWeb(privateKey?: string) {
  const tronWeb = new TronWeb({
    fullHost: TRON_FULL_HOST,
    headers: {
      "TRON-PRO-API-KEY": process.env.TRON_PRO_API_KEY || "",
    },
    ...(privateKey ? { privateKey } : {}),
  });

  if (privateKey) {
    const address = tronWeb.address.fromPrivateKey(privateKey);

    if (address) {
      tronWeb.setAddress(address);
    }
  }

  return tronWeb;
}