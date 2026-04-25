import { NextResponse } from "next/server";
import { ethers } from "ethers";

const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
];

export async function POST(req: Request) {
  try {
    const { to, amount } = await req.json();

    const rpcUrl = (
      process.env.ETH_RPC_URL ||
      process.env.NEXT_PUBLIC_ETH_RPC_URL ||
      process.env.NEXT_PUBLIC_RPC_URL ||
      ""
    ).trim();

    const privateKey = (process.env.PRIVATE_KEY || "").trim();
    const usdtContract = (process.env.USDT_CONTRACT || "").trim();

    if (!rpcUrl || !privateKey || !usdtContract) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing ETH RPC, PRIVATE_KEY, or USDT_CONTRACT.",
          debug: {
            rpc: rpcUrl ? "EXISTS" : "MISSING",
            pk: privateKey ? "EXISTS" : "MISSING",
            usdt: usdtContract ? "EXISTS" : "MISSING",
          },
        },
        { status: 500 }
      );
    }

    if (!ethers.isAddress(to)) {
      return NextResponse.json(
        { success: false, error: "Invalid recipient address." },
        { status: 400 }
      );
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid USDT amount." },
        { status: 400 }
      );
    }

    const normalizedPrivateKey = privateKey.startsWith("0x")
      ? privateKey
      : `0x${privateKey}`;

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(normalizedPrivateKey, provider);
    const usdt = new ethers.Contract(usdtContract, USDT_ABI, wallet);

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
      {
        success: false,
        error: error?.message || "USDT send failed.",
      },
      { status: 500 }
    );
  }
}