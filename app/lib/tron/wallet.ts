import { TronWeb } from "tronweb";

export type TronLocalWallet = {
  address: string;      // Base58, starts with T...
  hexAddress: string;
  privateKey: string;
  publicKey: string;
};

export async function generateTronWallet(): Promise<TronLocalWallet> {
  const account = await TronWeb.createAccount();

  return {
    address: account.address.base58,
    hexAddress: account.address.hex,
    privateKey: account.privateKey,
    publicKey: account.publicKey,
  };
}