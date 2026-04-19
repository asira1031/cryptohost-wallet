import { ethers } from "ethers";

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

export async function sendWithFee({
  rpcUrl,
  privateKey,
  tokenAddress,
  to,
  amount,        // human amount e.g. "100"
  feePercent,    // e.g. 2
  feeWallet,
}: {
  rpcUrl: string;
  privateKey: string;
  tokenAddress: string;
  to: string;
  amount: string;
  feePercent: number;
  feeWallet: string;
}) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

  const decimals: number = await token.decimals();
  const amt = ethers.parseUnits(amount, decimals);

  // percent → basis points
  const fee = (amt * BigInt(Math.round(feePercent * 100))) / BigInt(10000);
  const net = amt - fee;

  // 1) send net to destination
  const tx1 = await token.transfer(to, net);
  await tx1.wait();

  // 2) send fee to fee wallet
  const tx2 = await token.transfer(feeWallet, fee);
  await tx2.wait();

  return { tx1Hash: tx1.hash, tx2Hash: tx2.hash };
}