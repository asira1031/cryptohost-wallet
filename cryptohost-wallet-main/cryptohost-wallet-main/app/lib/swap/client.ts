import type { SwapApiResponse, SwapQuoteRequest } from "./types";

export async function getSwapQuote(
  payload: SwapQuoteRequest
): Promise<SwapApiResponse> {
  const res = await fetch("/api/swap/quote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as SwapApiResponse;

  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Failed to fetch swap quote.");
  }

  return data;
}