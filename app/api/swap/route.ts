export async function POST(req: Request) {
  const body = await req.json();

  return Response.json({
    success: true,
    action: "swap",
    from: body.from,
    to: body.to,
    amount: body.amount,
  });
}