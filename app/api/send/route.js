export async function POST(req) {
  const body = await req.json();
  const feeWallet = process.env.FEE_WALLET;

  return Response.json({
    success: true,
    action: "send",
    to: body.to,
    amount: body.amount,
    feeWallet,
  });
}