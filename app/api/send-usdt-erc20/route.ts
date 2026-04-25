import { NextResponse } from "next/server";
import { ethers } from "ethers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USDT_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
];

export async function POST(req: Request) {
  try {
    const { to, amount } = await req.json();

    const rawPrivateKey = (process.env.PRIVATE_KEY || "").trim();

    if (!rawPrivateKey) {
      return NextResponse.json(
        { success: false, error: "PRIVATE_KEY missing in Vercel environment." },
        { status: 500 }
      );
    }

    const privateKey = rawPrivateKey.startsWith("0x")
      ? rawPrivateKey
      : `0x${rawPrivateKey}`;

    if (!ethers.isAddress(to)) {
      return NextResponse.json(
        { success: false, error: "Invalid recipient address." },
        { status: 400 }
      );
    }

    const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
    const wallet = new ethers.Wallet(privateKey, provider);
    const usdt = new ethers.Contract(USDT_CONTRACT, USDT_ABI, wallet);

    const decimals = Number(await usdt.decimals());
    const units = ethers.parseUnits(String(amount), decimals);

    const balance = await usdt.balanceOf(wallet.address);

    if (balance < units) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient USDT balance.",
          sender: wallet.address,
        },
        { status: 400 }
      );
    }

    const tx = await usdt.transfer(to, units);
    const receipt = await tx.wait();

    return NextResponse.json({
      success: true,
      hash: tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      from: wallet.address,
      to,
      amount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "USDT send failed." },
      { status: 500 }
    );
  }
}