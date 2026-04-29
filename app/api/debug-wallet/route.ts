import { ethers } from "ethers";

export async function GET() {
  try {
    const rpc =
      process.env.RPC_URL?.trim() ||
      process.env.NEXT_PUBLIC_ETH_RPC_URL?.trim();

    const pk = process.env.PRIVATE_KEY?.trim();

    if (!rpc) throw new Error("RPC_URL missing");
    if (!pk) throw new Error("PRIVATE_KEY missing");

    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(pk, provider);

    const balance = await provider.getBalance(wallet.address);

    return Response.json({
      success: true,
      sender: wallet.address,
      balance: ethers.formatEther(balance),
      network: "Ethereum Mainnet",
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error?.message || "Debug failed",
      },
      { status: 500 }
    );
  }
}