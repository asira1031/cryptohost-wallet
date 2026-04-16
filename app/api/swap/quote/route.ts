import { NextRequest, NextResponse } from "next/server";
import { CHAIN_CONFIG } from "@/app/lib/swap/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SupportedChainKey = keyof typeof CHAIN_CONFIG;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const chain = body?.chain as SupportedChainKey | undefined;
    const fromToken = String(body?.fromToken || "").trim();
    const toToken = String(body?.toToken || "").trim();
    const amountWei = String(body?.amountWei || "").trim();
    const walletAddress = String(body?.walletAddress || "").trim();
    const slippage =
      typeof body?.slippage === "number" && body.slippage > 0
        ? body.slippage
        : 1;

    if (!chain || !fromToken || !toToken || !amountWei || !walletAddress) {
      return NextResponse.json(
        { ok: false, error: "Missing required swap fields." },
        { status: 400 }
      );
    }

    const chainConfig = CHAIN_CONFIG[chain];

    if (!chainConfig) {
      return NextResponse.json(
        { ok: false, error: "Unsupported chain." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ONEINCH_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing ONEINCH_API_KEY in .env.local" },
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
      disableEstimate: "false",
      allowPartialFill: "false",
    });

    // TEMPORARILY DISABLE FEE UNTIL SWAP WORKS CLEANLY
    // We will add platform fee back later with the correct 1inch integrator flow.

    const url = `https://api.1inch.dev/swap/v6.0/${chainConfig.chainId}/swap?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();

    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "1inch returned a non-JSON response.",
          raw: text.slice(0, 300),
        },
        { status: 502 }
      );
    }

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