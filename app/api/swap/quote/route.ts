export const dynamic = "force-static";

export async function POST() {
  return new Response(
    JSON.stringify({
      ok: false,
      error: "Swap temporarily disabled in mobile build.",
      quote: null,
      tx: null,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}