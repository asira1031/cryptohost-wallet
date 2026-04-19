export const dynamic = "force-static";

export async function GET() {
  return new Response(
    JSON.stringify({
      ethereum: { usd: 0, usd_24h_change: 0 },
      tether: { usd: 1, usd_24h_change: 0 },
      binancecoin: { usd: 0, usd_24h_change: 0 },
      solana: { usd: 0, usd_24h_change: 0 },
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}