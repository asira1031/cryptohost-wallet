import { NextResponse } from "next/server";
import { ethers } from "ethers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const rpc =
      process.env
        .NEXT_PUBLIC_BSC_RPC_URL ||
      "https://bsc-dataseed.binance.org";

    if (!to || !ethers.isAddress(to))
      throw new Error(
        "Invalid recipient"
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

    const provider =
      new ethers.JsonRpcProvider(
        rpc
      );

    const wallet =
      new ethers.Wallet(
        privateKey,
        provider
      );

    const value =
      ethers.parseEther(
        amount
      );

    const balance =
      await provider.getBalance(
        wallet.address
      );

    if (balance < value)
      throw new Error(
        "Insufficient BNB balance"
      );

    const tx =
      await wallet.sendTransaction({
        to,
        value,
      });

    await tx.wait();

    return NextResponse.json({
      success: true,
      hash: tx.hash,
      from: wallet.address,
      to,
      amount,
      asset: "BNB",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "BNB send failed",
      },
      { status: 500 }
    );
  }
}