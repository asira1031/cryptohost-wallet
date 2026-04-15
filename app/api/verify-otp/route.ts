import { NextResponse } from "next/server";

let otpStore: Record<string, string> = {};

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  if (otpStore[email] === otp) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false });
}