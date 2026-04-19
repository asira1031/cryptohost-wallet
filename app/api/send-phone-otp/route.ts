export const dynamic = "force-static";

export async function POST() {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Phone OTP temporarily disabled in mobile build.",
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
}