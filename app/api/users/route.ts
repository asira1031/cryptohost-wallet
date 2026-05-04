import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const { wallet, referrer, user_id } = await req.json();

    const { error } = await supabase.from("users").insert([
      {
        wallet,
        referrer,
        user_id,
      },
    ]);

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "fail" }), {
      status: 500,
    });
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    console.error("SUPABASE FETCH ERROR:", error);
    return NextResponse.json({ users: [] });
  }

  return NextResponse.json({ users: data });
}