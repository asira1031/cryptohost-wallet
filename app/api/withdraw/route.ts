export async function POST(req: Request) {
  const body = await req.json();

  return Response.json({
    success: true,
    action: "withdraw",
    amount: body.amount,
    wallet: process.env.FEE_WALLET,
  });
}