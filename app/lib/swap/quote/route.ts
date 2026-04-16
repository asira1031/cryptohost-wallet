import { NextRequest, NextResponse } from "next/server";
import { CHAIN_CONFIG } from "@/app/lib/swap/tokens";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      chain,
      fromToken,
      toToken,
      amountWei,
      walletAddress,
      slippage = 1,
    } = body || {};

    if (!chain || !fromToken || !toToken || !amountWei || !walletAddress) {
      return NextResponse.json(
        { ok: false, error: "Missing required swap fields." },
        { status: 400 }
      );
    }

    const chainConfig = CHAIN_CONFIG[chain as keyof typeof CHAIN_CONFIG];

    if (!chainConfig) {
      return NextResponse.json(
        { ok: false, error: "Unsupported chain." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ONEINCH_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing ONEINCH_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const feeBps = process.env.NEXT_PUBLIC_SWAP_FEE_BPS || "100";
    const feeWallet = process.env.NEXT_PUBLIC_SWAP_FEE_WALLET;

    if (!feeWallet) {
      return NextResponse.json(
        { ok: false, error: "Missing NEXT_PUBLIC_SWAP_FEE_WALLET in .env.local" },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      src: fromToken,
      dst: toToken,
      amount: amountWei,
      from: walletAddress,
      receiver: walletAddress,
      slippage: String(slippage),
      fee: feeBps,
      referral: feeWallet,
      disableEstimate: "false",
      allowPartialFill: "false",
    });

    const url = `https://api.1inch.dev/swap/v6.0/${chainConfig.chainId}/swap?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.description || data?.error || "Swap quote failed.",
          raw: data,
        },
        { status: res.status }
      );
    }

    return NextResponse.json({
      ok: true,
      quote: data,
      tx: data?.tx || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unexpected swap error.",
      },
      { status: 500 }
    );
  }
}