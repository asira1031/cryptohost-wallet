export async function POST(req) {
  const body = await req.json();

  return Response.json({
    success: true,
    action: "withdraw",
    amount: body.amount,
    wallet: process.env.FEE_WALLET,
  });
}