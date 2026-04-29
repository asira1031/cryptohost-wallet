import { ethers } from "ethers";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { to, amount } = body as {
      to: string;
      amount: string | number;
    };

    // ENV VARIABLES
    const rpc =
      process.env.RPC_URL?.trim() ||
      process.env.NEXT_PUBLIC_ETH_RPC_URL?.trim();

    const pk =
      process.env.PRIVATE_KEY?.trim();

    const feeWallet =
      process.env.FEE_WALLET?.trim();

    // VALIDATION
    if (!rpc)
      throw new Error("RPC_URL missing");

    if (!pk)
      throw new Error("PRIVATE_KEY missing");

    if (!to)
      throw new Error(
        "Recipient address missing"
      );

    if (!amount)
      throw new Error("Amount missing");

    if (!ethers.isAddress(to)) {
      throw new Error(
        "Invalid recipient address"
      );
    }

    if (
      feeWallet &&
      !ethers.isAddress(feeWallet)
    ) {
      throw new Error(
        "Invalid fee wallet"
      );
    }

    // CONNECT PROVIDER + WALLET
    const provider =
      new ethers.JsonRpcProvider(rpc);

    const wallet =
      new ethers.Wallet(
        pk,
        provider
      );

    // USER SEND AMOUNT
    const sendAmount =
      ethers.parseEther(
        amount.toString()
      );

    // 1.5% SERVICE FEE
    const fee =
      (sendAmount * 15n) / 1000n;

    // CHECK BALANCE
    const balance =
      await provider.getBalance(
        wallet.address
      );

    // GAS RESERVE
    const gasReserve =
      ethers.parseEther(
        "0.0001"
      );

    // TOTAL REQUIRED
    const totalNeeded =
      sendAmount +
      fee +
      gasReserve;

    if (balance < totalNeeded) {
      throw new Error(
        "Insufficient wallet balance for amount + fee + gas"
      );
    }

    // MAIN SEND
    const mainTx =
      await wallet.sendTransaction({
        to,
        value: sendAmount,
      });

    await mainTx.wait();

    // FEE SEND
    let feeTxHash:
      | string
      | null = null;

    if (
      fee > 0n &&
      feeWallet
    ) {
      const feeTx =
        await wallet.sendTransaction(
          {
            to: feeWallet,
            value: fee,
          }
        );

      await feeTx.wait();

      feeTxHash =
        feeTx.hash;
    }

    return Response.json({
      success: true,
      sender:
        wallet.address,
      recipient: to,
      amount,
      feePercent: "1.5%",
      mainTx:
        mainTx.hash,
      feeTx:
        feeTxHash,
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error:
          error?.message ||
          "Send failed",
      },
      {
        status: 500,
      }
    );
  }
}