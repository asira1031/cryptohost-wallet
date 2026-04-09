import type { TxHistoryItem } from "../../types/wallet";

const STORAGE_KEY = "cryptohost_wallet_tx_history";

export function getStoredHistory(): TxHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TxHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredHistory(items: TxHistoryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addHistoryItem(item: TxHistoryItem) {
  const current = getStoredHistory();
  const updated = [item, ...current];
  saveStoredHistory(updated);
}

export function updateHistoryStatus(
  hash: string,
  status: TxHistoryItem["status"]
) {
  const current = getStoredHistory();
  const updated = current.map((item) =>
    item.hash === hash ? { ...item, status } : item
  );
  saveStoredHistory(updated);
}