import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message } = await req.json();

  let reply = "Sorry, please contact support.";

  // 🔹 Basic AI logic (you can expand)
  if (message.toLowerCase().includes("benefits")) {
    reply = "CryptoHost Wallet allows secure sending, receiving, and swapping of crypto with full control.";
  }

  else if (message.toLowerCase().includes("register")) {
    reply = "To register, open the wallet, create an account, and secure your private key.";
  }

  else if (message.toLowerCase().includes("transfer")) {
    reply = "To transfer crypto, go to SEND tab, enter wallet address, amount, and confirm.";
  }

  else if (message.toLowerCase().includes("pending")) {
    reply = "Pending transactions are usually due to low gas fees or network congestion.";
  }

  else if (message.toLowerCase().includes("gas")) {
    reply = "Gas fees are required to process transactions on the blockchain.";
  }

  else if (message.toLowerCase().includes("password")) {
    reply = "If you forgot your password, restore your wallet using your recovery phrase.";
  }

  return NextResponse.json({ reply });
}