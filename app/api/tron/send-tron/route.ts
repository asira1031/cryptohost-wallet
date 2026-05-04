import { NextResponse } from "next/server";
import { sendUsdtTrc20WithFee } from "@/app/lib/tron/send";

export async function POST(req: Request) {
  try {
    const { to, amount, privateKey } =
      await req.json();

    if (!to) throw new Error("Missing recipient");
    if (!amount) throw new Error("Missing amount");
    if (!privateKey)
      throw new Error("Missing private key");

    const result =
      await sendUsdtTrc20WithFee({
        to,
        amount,
        privateKey,
      });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "TRON send failed",
      },
      { status: 500 }
    );
  }
}