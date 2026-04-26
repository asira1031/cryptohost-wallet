import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const router = useRouter();

useEffect(() => {
  router.replace("/upgrading");
}, []);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#02111f] px-3 py-2 text-white">
      <div className="mx-auto w-full max-w-[390px]">
        <div className="rounded-[30px] border border-cyan-500/20 bg-[radial-gradient(circle_at_top,#0c3340_0%,#071824_35%,#031019_100%)] p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div className="mb-3 flex flex-wrap gap-2">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-medium text-white/90"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/wallet"
              className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-4 py-2 text-[11px] font-medium text-emerald-200"
            >
              Wallet
            </Link>

            <Link
              href="/dashboard/market"
              className="rounded-full border border-cyan-400/30 bg-cyan-500/20 px-4 py-2 text-[11px] font-medium text-cyan-200"
            >
              Market
            </Link>

            <Link
              href="/dashboard/history"
              className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/20 px-4 py-2 text-[11px] font-medium text-fuchsia-200"
            >
              History
            </Link>

            <Link
              href="/dashboard/security"
              className="rounded-full border border-amber-400/30 bg-amber-500/20 px-4 py-2 text-[11px] font-medium text-amber-200"
            >
              Security
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}