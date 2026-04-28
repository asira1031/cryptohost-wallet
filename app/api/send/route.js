import { ethers } from "ethers";

export async function POST(req) {
  try {
    const body = await req.json();

    const { to, amount } = body;

    const rpc = process.env.RPC_URL;
    const feeWallet = process.env.FEE_WALLET;

    if (!rpc) throw new Error("RPC_URL missing");
    if (!pk) throw new Error("PRIVATE_KEY missing");
    if (!to) throw new Error("Recipient missing");
    if (!amount) throw new Error("Amount missing");

    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(pk, provider);

    const totalAmount = ethers.parseEther(amount.toString());

    const fee = totalAmount * 15n / 1000n; // 1.5%
    const sendAmount = totalAmount - fee;

    const mainTx = await wallet.sendTransaction({
      to,
      value: sendAmount,
    });

    await mainTx.wait();

    let feeTxHash = null;

    if (fee > 0n && feeWallet) {
      const feeTx = await wallet.sendTransaction({
        to: feeWallet,
        value: fee,
      });

      await feeTx.wait();
      feeTxHash = feeTx.hash;
    }

    return Response.json({
      success: true,
      mainTx: mainTx.hash,
      feeTx: feeTxHash,
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}