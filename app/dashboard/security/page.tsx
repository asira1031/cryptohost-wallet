"use client";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#06121f] px-6 py-10 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-cyan-900/40 bg-[#071b2b] p-8 shadow-2xl">
        <h1 className="mb-6 text-2xl font-semibold">Security</h1>

        <div className="rounded-2xl border border-cyan-800/30 bg-[#082235] p-6">
          <h2 className="mb-4 text-xl font-medium">Security Verification</h2>

          <p className="mb-6 text-sm text-gray-300">
            Choose your preferred verification method for account protection and transaction approval.
          </p>

          <div className="space-y-4">
            <button
              type="button"
              className="w-full rounded-xl border border-white/10 bg-[#0a1730] px-4 py-4 text-left transition hover:bg-[#102042]"
            >
              <div className="text-base font-semibold text-white">Email OTP</div>
              <div className="mt-1 text-sm text-gray-400">
                Receive a one-time verification code in your email.
              </div>
            </button>

            <button
              type="button"
              className="w-full rounded-xl border border-white/10 bg-[#0a1730] px-4 py-4 text-left transition hover:bg-[#102042]"
            >
              <div className="text-base font-semibold text-white">Phone OTP</div>
              <div className="mt-1 text-sm text-gray-400">
                Receive a one-time verification code by SMS using your global phone number.
              </div>
            </button>

            <div className="w-full rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-4 text-left">
              <div className="text-base font-semibold text-yellow-300">
                Authenticator
              </div>
              <div className="mt-1 text-sm text-yellow-200/90">
                Temporarily disabled. Please use Email OTP or Phone OTP for now.
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
            Your wallet security is currently handled through OTP verification instead of authenticator setup.
          </div>
        </div>
      </div>
    </div>
  );
}