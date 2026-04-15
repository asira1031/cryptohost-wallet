import { NextResponse } from "next/server";

let otpStore: Record<string, string> = {};

export async function POST(req: Request) {
  const { email } = await req.json();

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[email] = otp;

  console.log("OTP for", email, ":", otp); // 🔥 TEMP (for testing)

  return NextResponse.json({ success: true });
}