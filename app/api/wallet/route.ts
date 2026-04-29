export async function GET() {
  return Response.json({
    status: "connected",
    wallet: process.env.FEE_WALLET,
  });
}