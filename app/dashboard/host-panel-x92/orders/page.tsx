"use client";

import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("cryptohost_orders") || "[]");
    setOrders(saved);
  }, []);

  const updateStatus = (id: string, status: string) => {
    const updated = orders.map((order) =>
      order.id === id ? { ...order, status } : order
    );

    setOrders(updated);

    localStorage.setItem(
      "cryptohost_orders",
      JSON.stringify(updated)
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">
        CryptoHost Orders Admin
      </h1>

      <div className="space-y-4">
        {orders.length === 0 && (
          <p className="text-zinc-400">No orders yet.</p>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-zinc-900 p-4 rounded-xl"
          >
            <p>ID: {order.id}</p>
            <p>Type: {order.type}</p>
            <p>Coin: {order.coin}</p>
            <p>Amount: ₱{order.amount}</p>
            <p>Status: {order.status}</p>
            <p>Date: {order.date}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() =>
                  updateStatus(order.id, "Processing")
                }
                className="bg-blue-600 px-3 py-1 rounded"
              >
                Process
              </button>

              <button
                onClick={() =>
                  updateStatus(order.id, "Completed")
                }
                className="bg-green-600 px-3 py-1 rounded"
              >
                Complete
              </button>

              <button
                onClick={() =>
                  updateStatus(order.id, "Cancelled")
                }
                className="bg-red-600 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}