import { NextResponse } from "next/server";
import { TronWeb } from "tronweb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FULL_HOST =
  "https://api.trongrid.io";

const USDT_CONTRACT =
  "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      to,
      amount,
      privateKey,
    } = body as {
      to: string;
      amount: string;
      privateKey: string;
    };

    if (!to)
      throw new Error(
        "Recipient required"
      );

    if (
      !amount ||
      Number(amount) <= 0
    )
      throw new Error(
        "Invalid amount"
      );

    if (!privateKey)
      throw new Error(
        "Missing private key"
      );

    const tronWeb =
      new TronWeb({
        fullHost:
          FULL_HOST,
        privateKey,
      });

    const contract =
      await tronWeb
        .contract()
        .at(
          USDT_CONTRACT
        );

    const units =
      Math.floor(
        Number(amount) *
          1000000
      );

    const tx =
      await contract.transfer(
        to,
        units
      ).send();

    return NextResponse.json({
      success: true,
      txid: tx,
      to,
      amount,
      asset:
        "USDT TRC20",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "TRC20 send failed",
      },
      { status: 500 }
    );
  }
}