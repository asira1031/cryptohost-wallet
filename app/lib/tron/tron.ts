// @ts-ignore
import TronWeb from "tronweb";

export function getTronWeb(privateKey?: string) {
  const fullHost = "https://api.trongrid.io";

  // @ts-ignore
  return new TronWeb({
    fullHost,
    privateKey: privateKey || undefined,
  });
}