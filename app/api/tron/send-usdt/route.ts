import { NextRequest, NextResponse } from "next/server";
import { sendUsdtTrc20WithFee } from "@/app/lib/tron/send";

export async function POST(req: NextRequest) {
  try {
    const { privateKey, to, amount } = await req.json();

    const result = await sendUsdtTrc20WithFee({
      privateKey,
      to,
      amount,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Send failed" },
      { status: 500 }
    );
  }
}