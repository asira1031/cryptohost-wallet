"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    loadOrders();
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
            <p><b>ID:</b> {order.id}</p>
            <p><b>Type:</b> {order.order_type}</p>
            <p><b>Coin:</b> {order.coin}</p>
            <p><b>Amount:</b> ₱{order.amount}</p>
            <p><b>Status:</b> {order.status}</p>
            <p><b>Date:</b> {order.created_at}</p>

            {order.proof && (
              <div className="mt-3 bg-black p-3 rounded">
                <p className="font-bold text-yellow-400">
                  Proof / TX Hash
                </p>

                <p className="break-all text-sm">
                  {order.proof}
                </p>
              </div>
            )}

            <div className="flex gap-2 mt-4 flex-wrap">
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