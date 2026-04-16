import { ethers } from "ethers";
import type { SupportedNetworkKey } from "../../types/wallet";
import { getNetworkConfig } from "./chains";
import { TOKENS } from "./tokens";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

export function getRpcProvider(network: SupportedNetworkKey) {
  const config = getNetworkConfig(network);

  if (!config.rpcUrl) {
    throw new Error(`Missing RPC URL for ${config.label}`);
  }

  return new ethers.JsonRpcProvider(config.rpcUrl);
}

export function getUsdtAddress(network: SupportedNetworkKey) {
  const usdt = TOKENS.find((t) => t.symbol === "USDT");
  const address = usdt?.addresses[network];

  if (!address) {
    throw new Error(`USDT is not configured for ${network}`);
  }

  return address;
}

export function getErc20Contract(
  tokenAddress: string,
  signerOrProvider: ethers.Signer | ethers.Provider
) {
  return new ethers.Contract(tokenAddress, ERC20_ABI, signerOrProvider);
}

export async function fetchUsdtBalance(
  network: SupportedNetworkKey,
  walletAddress: string
) {
  const provider = getRpcProvider(network);
  const tokenAddress = getUsdtAddress(network);
  const contract = getErc20Contract(tokenAddress, provider);

  const rawBalance = await contract.balanceOf(walletAddress);
  return ethers.formatUnits(rawBalance, 6);
}

export async function estimateNativeGas(params: {
  network: SupportedNetworkKey;
  fromPrivateKey: string;
  to: string;
  amount: string;
}) {
  const provider = getRpcProvider(params.network);
  const wallet = new ethers.Wallet(params.fromPrivateKey, provider);

  const tx = {
    to: params.to,
    value: ethers.parseEther(params.amount),
    from: wallet.address,
  };

  const gasLimit = await provider.estimateGas(tx);
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice ?? BigInt(0);
  const estimatedFee = gasLimit * gasPrice;

  return {
    gasLimit: gasLimit.toString(),
    gasPrice: gasPrice.toString(),
    estimatedFeeWei: estimatedFee.toString(),
    estimatedFeeNative: ethers.formatEther(estimatedFee),
  };
}

export async function estimateUsdtGas(params: {
  network: SupportedNetworkKey;
  fromPrivateKey: string;
  to: string;
  amount: string;
}) {
  const provider = getRpcProvider(params.network);
  const wallet = new ethers.Wallet(params.fromPrivateKey, provider);
  const tokenAddress = getUsdtAddress(params.network);
  const contract = getErc20Contract(tokenAddress, wallet);

  const amountUnits = ethers.parseUnits(params.amount, 6);
  const gasLimit = await contract.transfer.estimateGas(params.to, amountUnits);
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice ?? BigInt(0);
  const estimatedFee = gasLimit * gasPrice;

  return {
    gasLimit: gasLimit.toString(),
    gasPrice: gasPrice.toString(),
    estimatedFeeWei: estimatedFee.toString(),
    estimatedFeeNative: ethers.formatEther(estimatedFee),
  };
}

export async function sendNative(params: {
  network: SupportedNetworkKey;
  fromPrivateKey: string;
  to: string;
  amount: string;
}) {
  const provider = getRpcProvider(params.network);
  const wallet = new ethers.Wallet(params.fromPrivateKey, provider);

  const tx = await wallet.sendTransaction({
    to: params.to,
    value: ethers.parseEther(params.amount),
  });

  return tx;
}

export async function sendUsdt(params: {
  network: SupportedNetworkKey;
  fromPrivateKey: string;
  to: string;
  amount: string;
}) {
  const provider = getRpcProvider(params.network);
  const wallet = new ethers.Wallet(params.fromPrivateKey, provider);
  const tokenAddress = getUsdtAddress(params.network);
  const contract = getErc20Contract(tokenAddress, wallet);

  const amountUnits = ethers.parseUnits(params.amount, 6);
  const tx = await contract.transfer(params.to, amountUnits);

  return tx;
}