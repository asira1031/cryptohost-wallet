import { NextResponse } from "next/server";
import { sendWithFee } from "@/app/lib/sell-transfer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, asset } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Invalid sell amount." },
        { status: 400 }
      );
    }

    const tokenAddress =
      asset === "USDT"
        ? process.env.USDT_CONTRACT
        : asset === "ETH"
        ? process.env.ETH_TOKEN_CONTRACT
        : asset === "BNB"
        ? process.env.BNB_TOKEN_CONTRACT
        : asset === "TRX"
        ? process.env.TRX_TOKEN_CONTRACT
        : undefined;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: "Unsupported asset." },
        { status: 400 }
      );
    }

    const result = await sendWithFee({
      rpcUrl: process.env.RPC_URL!,
      privateKey: process.env.PRIVATE_KEY!,
      tokenAddress,
      to: process.env.PAYOUT_WALLET!,
      amount: String(amount),
      feePercent: 2,
      feeWallet: process.env.FEE_WALLET!,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("SELL API ERROR:", error);
    return NextResponse.json(
      { error: "Transaction failed." },
      { status: 500 }
    );
  }
}