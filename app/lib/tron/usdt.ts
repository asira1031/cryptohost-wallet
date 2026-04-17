import { getTronWeb } from "./client";
import { TRON_USDT_CONTRACT } from "./config";

const trc20Abi = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
];

export async function getTronTrxBalance(address: string) {
  const tronWeb = getTronWeb();
  const sun = await tronWeb.trx.getBalance(address);
  return Number(sun) / 1_000_000;
}

export async function getTronUsdtBalance(address: string) {
  const tronWeb = getTronWeb();

  // important for contract read context
  tronWeb.setAddress(address);

  const contract = await tronWeb.contract(trc20Abi, TRON_USDT_CONTRACT);

  const rawBalance = await contract.balanceOf(address).call();
  const decimals = await contract.decimals().call();
  const symbol = await contract.symbol().call();

  const raw = BigInt(rawBalance.toString());
  const dec = Number(decimals);
  const formatted = Number(raw) / 10 ** dec;

  return {
    raw: raw.toString(),
    decimals: dec,
    symbol: symbol.toString(),
    formatted,
  };
}