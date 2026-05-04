"use client";

import { useEffect, useState } from "react";

export default function AgentP2PCard() {
  const [agentCode, setAgentCode] = useState("");
  const [status, setStatus] = useState("");
  const [isAgent, setIsAgent] = useState(false);
  const [refLink, setRefLink] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("isAgent");
    setIsAgent(saved === "true");

    const agent = localStorage.getItem("agentCode");

    if (agent) {
      const ref = `${window.location.origin}/?ref=${agent}`;
      setRefLink(ref);
    }
  }, []);

  function handleAgentAccess() {
    const allowed = [
      "CH-001",
      "CH-002",
      "CH-003",
      "CH-004",
      "CH-005",
      "CH-006",
      "CH-007",
      "CH-008",
      "CH-009",
      "CH-010",
    ];

    if (!allowed.includes(agentCode)) {
      setStatus("Invalid agent code");
      return;
    }

    localStorage.setItem("isAgent", "true");
    localStorage.setItem("agentCode", agentCode);

    setIsAgent(true);

    const ref = `${window.location.origin}/?ref=${agentCode}`;
    setRefLink(ref);

    setStatus("Agent activated");
  }

  function copyLink() {
    if (!refLink) {
      setStatus("Link not ready");
      return;
    }

    navigator.clipboard.writeText(refLink);
    setStatus("Referral link copied");
  }

  // 🔥 RESET FUNCTION
  function resetAgent() {
    localStorage.removeItem("isAgent");
    localStorage.removeItem("agentCode");
    localStorage.removeItem("ref_id");

    setIsAgent(false);
    setRefLink("");
    setAgentCode("");
    setStatus("Agent reset");
  }

  return (
    <div className="rounded-3xl bg-zinc-950 border border-white/10 p-5 mt-5 space-y-5">

      <p className="text-sm text-zinc-400">
        Referral System
      </p>

      {!isAgent && (
        <div className="space-y-3">
          <input
            type="text"
            value={agentCode}
            onChange={(e) => setAgentCode(e.target.value)}
            placeholder="Enter Agent Code (CH-001)"
            className="w-full rounded-xl bg-zinc-900 px-3 py-3 text-sm text-white"
          />

          <button
            onClick={handleAgentAccess}
            className="w-full rounded-xl bg-green-500 py-3 text-black text-sm font-semibold"
          >
            Activate Agent
          </button>
        </div>
      )}

      {isAgent && (
        <div className="space-y-3">

          <div className="text-xs text-green-400">
            Authorized Agent ✓
          </div>

          <div className="bg-zinc-900 rounded-xl p-3 text-xs break-all">
            {refLink || "Generating..."}
          </div>

          <button
            onClick={copyLink}
            className="w-full rounded-xl bg-blue-500 py-3 text-black text-sm font-semibold"
          >
            Copy Referral Link
          </button>

          {/* 🔥 RESET BUTTON */}
          <button
            onClick={resetAgent}
            className="w-full rounded-xl bg-red-500 py-2 text-black text-sm font-semibold"
          >
            Reset Agent
          </button>
        </div>
      )}

      {status && (
        <p className="text-xs text-zinc-400 text-center">
          {status}
        </p>
      )}
    </div>
  );
}