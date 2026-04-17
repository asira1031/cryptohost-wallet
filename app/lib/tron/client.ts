import { TronWeb } from "tronweb";
import { TRON_FULL_HOST } from "./config";

export function getTronWeb(privateKey?: string) {
  const tronWeb = new TronWeb({
    fullHost: TRON_FULL_HOST,
    headers: {
      "TRON-PRO-API-KEY": process.env.TRON_PRO_API_KEY || "",
    },
    privateKey,
  });

  if (privateKey) {
    const derivedAddress = tronWeb.address.fromPrivateKey(privateKey);

    if (derivedAddress) {
      tronWeb.setAddress(derivedAddress);
    }
  }

  return tronWeb;
}