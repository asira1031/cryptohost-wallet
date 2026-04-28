export async function GET() {
  const feeWallet = process.env.FEE_WALLET;

  return Response.json({
    feeWallet,
  });
}