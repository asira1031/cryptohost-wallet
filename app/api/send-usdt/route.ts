import { NextResponse } from "next/server";
import { ethers } from "ethers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USDT_CONTRACT =
  "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const ABI = [
  "function transfer(address to, uint256 value) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
];

export async function POST(req: Request) {
  try {
    const { to, amount, privateKey } =
      await req.json();

    const rpc =
      process.env.RPC_URL ||
      process.env.NEXT_PUBLIC_ETH_RPC_URL;

    if (!rpc) throw new Error("RPC_URL missing");
    if (!privateKey)
      throw new Error("Wallet key missing");

    if (!ethers.isAddress(to))
      throw new Error("Invalid recipient");

    if (!amount || Number(amount) <= 0)
      throw new Error("Invalid amount");

    const provider =
      new ethers.JsonRpcProvider(rpc);

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

    // USDT = 6 decimals
    const units =
      ethers.parseUnits(
        amount.toString(),
        6
      );

    // Check token balance
    const usdtBal =
      await token.balanceOf(
        wallet.address
      );

    if (usdtBal < units) {
      throw new Error(
        "Insufficient USDT"
      );
    }

    // Check ETH gas
    const ethBal =
      await provider.getBalance(
        wallet.address
      );

    if (
      ethBal <
      ethers.parseEther("0.002")
    ) {
      throw new Error(
        "Need more ETH for gas"
      );
    }

    // Fresh nonce
    const nonce =
      await provider.getTransactionCount(
        wallet.address,
        "latest"
      );

    // Fee data
    const fee =
      await provider.getFeeData();

    const tx =
      await token.transfer(
        to,
        units,
        {
          nonce,
          gasLimit: 120000,
          maxFeePerGas:
            fee.maxFeePerGas ||
            ethers.parseUnits(
              "30",
              "gwei"
            ),
          maxPriorityFeePerGas:
            fee.maxPriorityFeePerGas ||
            ethers.parseUnits(
              "2",
              "gwei"
            ),
        }
      );

    const receipt =
      await tx.wait();

    return NextResponse.json({
      success: true,
      hash: tx.hash,
      block:
        receipt?.blockNumber,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.reason ||
          error?.shortMessage ||
          error?.message ||
          "USDT send failed",
      },
      { status: 500 }
    );
  }
}