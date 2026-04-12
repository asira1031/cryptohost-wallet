import { NextResponse } from "next/server";
import { ethers } from "ethers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, amount } = body as { to?: string; amount?: string };

    if (!to || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing recipient or amount." },
        { status: 400 }
      );
    }

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;

    if (!rpcUrl) {
      return NextResponse.json(
        { success: false, error: "Missing NEXT_PUBLIC_RPC_URL in .env.local" },
        { status: 500 }
      );
    }

    if (!privateKey) {
      return NextResponse.json(
        { success: false, error: "Missing PRIVATE_KEY in .env.local" },
        { status: 500 }
      );
    }

    if (!ethers.isAddress(to)) {
      return NextResponse.json(
        { success: false, error: "Invalid recipient address." },
        { status: 400 }
      );
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    const value = ethers.parseEther(amount);

    const balance = await provider.getBalance(wallet.address);

    if (balance < value) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient ETH balance for this send amount.",
          sender: wallet.address,
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
      blockNumber: receipt?.blockNumber ?? null,
      from: wallet.address,
      to,
      amount,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Transaction failed.",
      },
      { status: 500 }
    );
  }
}