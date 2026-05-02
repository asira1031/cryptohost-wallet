import { NextResponse } from "next/server";
import { ethers } from "ethers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USDT_CONTRACT =
  "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const ABI = [
  "function transfer(address to, uint256 value) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      to,
      amount,
      privateKey,
    } = body as {
      to: string;
      amount: string | number;
      privateKey: string;
    };

    const rpc =
      process.env.RPC_URL?.trim() ||
      process.env.NEXT_PUBLIC_ETH_RPC_URL?.trim();

    if (!rpc)
      throw new Error("RPC_URL missing");

    if (!privateKey)
      throw new Error("PRIVATE_KEY missing");

    if (!to || !ethers.isAddress(to))
      throw new Error("Invalid recipient");

    if (
      !amount ||
      Number(amount) <= 0
    )
      throw new Error("Invalid amount");

    const provider =
      new ethers.JsonRpcProvider(
        rpc
      );

    const wallet =
      new ethers.Wallet(
        privateKey,
        provider
      );

    const token =
      new ethers.Contract(
        USDT_CONTRACT,
        ABI,
        wallet
      );

    const decimals =
      await token.decimals();

    const units =
      ethers.parseUnits(
        amount.toString(),
        decimals
      );

    const bal =
      await token.balanceOf(
        wallet.address
      );

    if (bal < units)
      throw new Error(
        "Insufficient USDT balance"
      );

    const tx =
      await token.transfer(
        to,
        units
      );

    await tx.wait();

    return NextResponse.json({
      success: true,
      hash: tx.hash,
      from: wallet.address,
      to,
      amount,
      asset: "USDT",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "USDT send failed",
      },
      { status: 500 }
    );
  }
}