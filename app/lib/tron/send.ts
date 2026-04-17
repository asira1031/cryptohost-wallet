import { getTronWeb } from "./client";
import { TRON_USDT_CONTRACT } from "./config";

const trc20Abi = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
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
];

export async function sendUsdtTrc20WithFee(params: {
  privateKey: string;
  to: string;
  amount: string; // e.g. "100"
}) {
  const { privateKey, to, amount } = params;

  const tronWeb = getTronWeb(privateKey);
  const contract = await tronWeb.contract(trc20Abi, TRON_USDT_CONTRACT);

  const decimals = Number(await contract.decimals().call());

  // convert to raw
  const [whole, frac = ""] = amount.split(".");
  const paddedFrac = (frac + "0".repeat(decimals)).slice(0, decimals);
  const rawAmount = BigInt(`${whole}${paddedFrac || ""}`);

  // 👉 FEE CALCULATION (2%)
  const feePercent = Number(process.env.TRON_FEE_PERCENT || 0.02);
  const feeWallet = process.env.TRON_FEE_WALLET!;

  const feeAmount = BigInt(Math.floor(Number(rawAmount) * feePercent));
  const sendAmount = rawAmount - feeAmount;

  if (sendAmount <= BigInt(0)) {
  throw new Error("Amount too small after fee.");
}

  // 👉 SEND MAIN AMOUNT
  const txMain = await contract
    .transfer(to, sendAmount.toString())
    .send({ feeLimit: 100_000_000 });

  // 👉 SEND FEE TO YOUR WALLET
  const txFee = await contract
    .transfer(feeWallet, feeAmount.toString())
    .send({ feeLimit: 100_000_000 });

  return {
    to,
    amount,
    feePercent,
    feeWallet,
    txMain,
    txFee,
  };
}