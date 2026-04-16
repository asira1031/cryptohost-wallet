import { NextResponse } from "next/server";
import { ethers } from "ethers";

export async function POST(req: Request) {
  try {
    const { to, amount } = await req.json();

    if (!to || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing recipient or amount." },
        { status: 400 }
      );
    }

    if (!ethers.isAddress(to)) {
      return NextResponse.json(
        { success: false, error: "Invalid recipient address." },
        { status: 400 }
      );
    }

    const rpcUrl =
      process.env.NEXT_PUBLIC_ETH_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;

    if (!rpcUrl) {
      return NextResponse.json(
        { success: false, error: "Missing NEXT_PUBLIC_ETH_RPC_URL or NEXT_PUBLIC_RPC_URL in .env.local" },
        { status: 500 }
      );
    }

    if (!privateKey) {
      return NextResponse.json(
        { success: false, error: "Missing PRIVATE_KEY in .env.local" },
        { status: 500 }
      );
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    const value = ethers.parseEther(String(amount));

    const balance = await provider.getBalance(wallet.address);
    if (balance < value) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient ETH balance.",
          sender: wallet.address,
          balance: ethers.formatEther(balance),
        },
        { status: 400 }
      );
    }

    const tx = await wallet.sendTransaction({
      to,
      value,
    });

    const receipt = await tx.wait();

    return NextResponse.json({
      success: true,
      hash: tx.hash,
      from: wallet.address,
      to,
      amount,
      blockNumber: receipt?.blockNumber ?? null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Standalone send failed.",
      },
      { status: 500 }
    );
  }
}