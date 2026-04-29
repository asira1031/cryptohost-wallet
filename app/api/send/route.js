import { ethers } from "ethers";

export async function POST(req) {
  try {
    const body = await req.json();
    const { to, amount } = body;

    // ENV VARIABLES
    const rpc =
      process.env.RPC_URL?.trim() ||
      process.env.NEXT_PUBLIC_ETH_RPC_URL?.trim();

    const pk = process.env.PRIVATE_KEY?.trim();
    const feeWallet = process.env.FEE_WALLET?.trim();

    // VALIDATION
    if (!rpc) throw new Error("RPC_URL missing");
    if (!pk) throw new Error("PRIVATE_KEY missing");
    if (!to) throw new Error("Recipient address missing");
    if (!amount) throw new Error("Amount missing");

    if (!ethers.isAddress(to)) {
      throw new Error("Invalid recipient address");
    }

    if (feeWallet && !ethers.isAddress(feeWallet)) {
      throw new Error("Invalid fee wallet");
    }

    // CONNECT PROVIDER + WALLET
    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(pk, provider);

    // AMOUNT PARSE
    const totalAmount = ethers.parseEther(amount.toString());

    // 1.5% FEE
    const fee = (totalAmount * 15n) / 1000n;
    const sendAmount = totalAmount - fee;

    if (sendAmount <= 0n) {
      throw new Error("Amount too small after fee");
    }

    // CHECK BALANCE
    const balance = await provider.getBalance(wallet.address);

    if (balance < totalAmount) {
      throw new Error("Insufficient wallet balance");
    }

    // MAIN SEND
    const mainTx = await wallet.sendTransaction({
      to,
      value: sendAmount,
    });

    await mainTx.wait();

    // FEE SEND
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
      sender: wallet.address,
      recipient: to,
      amount,
      feePercent: "1.5%",
      mainTx: mainTx.hash,
      feeTx: feeTxHash,
    });

  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message || "Send failed",
      },
      { status: 500 }
    );
  }
}