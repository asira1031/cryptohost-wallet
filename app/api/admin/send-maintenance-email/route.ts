import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const resend = new Resend(process.env.RESEND_API_KEY!);

    // GET USERS FROM SUPABASE AUTH
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers();

    if (error) {
      throw new Error(error.message);
    }

    let sent = 0;

    for (const user of users || []) {
      if (!user.email) continue;

      await resend.emails.send({
        from: "CryptoHost Support <onboarding@resend.dev>",
        to: user.email,
        subject: "CryptoHost Wallet System Maintenance Notice",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6">
            <h2>CryptoHost Wallet System Maintenance Notice</h2>

            <p>Hello CryptoHost User,</p>

            <p>
              Please be advised that the CryptoHost Wallet system will undergo
              scheduled maintenance from <strong>April 29 to May 3, 2026</strong>.
            </p>

            <p>
              During this maintenance period, some services may be temporarily unavailable:
            </p>

            <ul>
              <li>Wallet transaction processing</li>
              <li>Balance viewing inside the app</li>
              <li>Some wallet-related features</li>
            </ul>

            <p>
              <strong>All balances, funds, and reward points remain safe and intact.</strong>
            </p>

            <p>
              A follow-up notification will be sent once maintenance has been completed.
            </p>

            <p>Thank you for your patience and continued support.</p>

            <p><strong>CryptoHost Support Team</strong></p>
          </div>
        `,
      });

      sent++;
    }

    return NextResponse.json({
      success: true,
      totalUsers: users?.length || 0,
      sent,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Email sending failed",
      },
      { status: 500 }
    );
  }
}