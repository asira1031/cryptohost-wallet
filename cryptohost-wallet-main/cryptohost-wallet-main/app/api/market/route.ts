import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,binancecoin,solana&vs_currencies=usd&include_24hr_change=true",
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json({}, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}