"use client";

import { useEffect, useState } from "react";

export default function AgentDashboard({
  params,
}: {
  params: { code: string };
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const agentCode = params.code;

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();

        // filter users under this agent
       const filtered = data.users.filter(
  (u: any) =>
    u.referrer?.toLowerCase() === agentCode.toLowerCase()
);
        setUsers(filtered);
      } catch (err) {
        console.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [agentCode]);

  // 💰 simple commission
  const commissionPerUser = 1; // change later
  const totalUsers = users.length;
  const totalCommission = totalUsers * commissionPerUser;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto space-y-6">

        <h1 className="text-2xl font-bold text-yellow-400">
          Agent Dashboard
        </h1>

        <div className="bg-[#101010] border border-white/10 rounded-2xl p-4">
          <p className="text-sm text-white/60">Agent Code</p>
          <p className="text-lg font-semibold">{agentCode}</p>
        </div>

        <div className="bg-[#101010] border border-white/10 rounded-2xl p-4">
          <p className="text-sm text-white/60">Total Users</p>
          <p className="text-2xl font-bold">{totalUsers}</p>
        </div>

        <div className="bg-[#101010] border border-white/10 rounded-2xl p-4">
          <p className="text-sm text-white/60">Commission</p>
          <p className="text-2xl font-bold text-green-400">
            ${totalCommission}
          </p>
        </div>

        <div className="bg-[#101010] border border-white/10 rounded-2xl p-4">
          <p className="text-sm text-white/60 mb-3">
            Users under this agent
          </p>

          {loading ? (
            <p className="text-xs text-white/50">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-xs text-white/50">
              No users yet
            </p>
          ) : (
            <div className="space-y-2">
              {users.map((u, i) => (
                <div
                  key={i}
                  className="bg-black rounded-xl p-2 text-xs break-all"
                >
                  {u.wallet}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}