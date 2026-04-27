import { NextResponse } from "next/server";
import { ethers } from "ethers";

export async function POST(req: Request) {
  try {
    const body =
      await req.json();

    const {
      to,
      amount,
      privateKey,
    } = body as {
      to?: string;
      amount?: string;
      privateKey?: string;
    };

    if (
      !to ||
      !amount ||
      !privateKey
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing recipient, amount, or user privateKey.",
        },
        {
          status: 400,
        }
      );
    }

    const rpcUrl =
      process.env
        .NEXT_PUBLIC_ETH_RPC_URL ||
      process.env
        .NEXT_PUBLIC_RPC_URL;

    const feeWallet =
      process.env
        .FEE_WALLET;

    const feePercent =
      Number(
        process.env
          .SEND_FEE_PERCENT ||
          "1.5"
      );

    if (!rpcUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing RPC URL.",
        },
        {
          status: 500,
        }
      );
    }

    if (!feeWallet) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing FEE_WALLET in env.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !ethers.isAddress(to)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid recipient address.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !ethers.isAddress(
        feeWallet
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid fee wallet.",
        },
        {
          status: 500,
        }
      );
    }

    const provider =
      new ethers.JsonRpcProvider(
        rpcUrl
      );

    const wallet =
      new ethers.Wallet(
        privateKey,
        provider
      );

    const sendValue =
      ethers.parseEther(
        amount
      );

    const feeValue =
      (sendValue *
        BigInt(
          Math.round(
            feePercent *
              100
          )
        )) /
      10000n;

    const totalNeed =
      sendValue +
      feeValue;

    const balance =
      await provider.getBalance(
        wallet.address
      );

    if (
      balance <
      totalNeed
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Insufficient balance.",
          sender:
            wallet.address,
        },
        {
          status: 400,
        }
      );
    }

    const txMain =
      await wallet.sendTransaction(
        {
          to,
          value:
            sendValue,
        }
      );

    await txMain.wait();

    const txFee =
      await wallet.sendTransaction(
        {
          to: feeWallet,
          value:
            feeValue,
        }
      );

    await txFee.wait();

    return NextResponse.json(
      {
        success: true,
        hash:
          txMain.hash,
        feeHash:
          txFee.hash,
        from:
          wallet.address,
        to,
        amount,
        fee:
          ethers.formatEther(
            feeValue
          ),
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Transaction failed.",
      },
      {
        status: 500,
      }
    );
  }
}