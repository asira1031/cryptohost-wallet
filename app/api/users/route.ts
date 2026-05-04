import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const filePath = path.join(process.cwd(), "data", "users.json");

// read file safely
function readUsers() {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// write file safely
function writeUsers(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// 👉 SAVE USER
export async function POST(req: Request) {
  try {
    const { wallet, referrer } = await req.json();

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet required" },
        { status: 400 }
      );
    }

    const users = readUsers();

    // prevent duplicates
    const exists = users.find((u: any) => u.wallet === wallet);
    if (exists) {
      return NextResponse.json({
        success: true,
        message: "User already exists",
      });
    }

    const newUser = {
      wallet,
      referrer: referrer || null,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    return NextResponse.json({
      success: true,
      user: newUser,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Save failed" },
      { status: 500 }
    );
  }
}

// 👉 GET USERS (for dashboard later)
export async function GET() {
  const users = readUsers();
  return NextResponse.json({ users });
}