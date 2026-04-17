import { NextRequest, NextResponse } from "next/server";
import { getTronTrxBalance, getTronUsdtBalance } from "@/app/lib/tron/usdt";

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    const [trx, usdt] = await Promise.all([
      getTronTrxBalance(address),
      getTronUsdtBalance(address),
    ]);

    return NextResponse.json({ trx, usdt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch balance" },
      { status: 500 }
    );
  }
}