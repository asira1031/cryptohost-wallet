"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type ContentType =
  | "facebook"
  | "twitter"
  | "tiktok"
  | "blog"
  | "email";

function generateContent(type: ContentType, topic: string) {
  const cleanTopic = topic.trim() || "CryptoHost services";

  if (type === "facebook") {
    return `Looking for a smarter way to promote your brand? ${cleanTopic} is the perfect topic to highlight your value, connect with your audience, and build trust online. Stay visible, stay relevant, and let your content work for you every day. #CryptoHost #Marketing #DigitalGrowth`;
  }

  if (type === "twitter") {
    return `${cleanTopic} can be turned into strong, clear, high-impact content for your audience. Build visibility, trust, and engagement with smarter promotion. #CryptoHost #BrandGrowth`;
  }

  if (type === "tiktok") {
    return `TikTok Script

Hook:
Want to know why ${cleanTopic} matters right now?

Body:
Here is why people are paying attention. It creates stronger visibility, better trust, and more opportunities to connect with the right audience online.

Closing:
Follow CryptoHost for more smart digital content ideas.`;
  }

  if (type === "blog") {
    return `Title: ${cleanTopic}

Introduction:
${cleanTopic} is becoming an important focus for businesses and digital platforms that want to improve visibility, build trust, and strengthen audience engagement. Strong content helps explain value clearly and keeps a brand relevant in a competitive market.

Main Content:
When discussing ${cleanTopic}, the first priority is clarity. Readers want useful, simple, and trustworthy information. A well-written article should explain what it is, why it matters, and how it creates value for the audience. This makes the topic easier to understand and more effective for marketing and education.

Another important factor is consistency. Publishing content about ${cleanTopic} on a regular basis helps improve brand recognition and supports long-term audience growth. It also creates a stronger digital presence across search, social media, and direct communication channels.

Conclusion:
In today’s digital environment, ${cleanTopic} can be positioned as more than just a subject. It can become a strong content pillar that supports awareness, credibility, and ongoing business growth.`;
  }

  return `Subject: Promotion for ${cleanTopic}

Hello,

We would like to introduce content focused on ${cleanTopic}. This campaign is designed to increase visibility, strengthen audience engagement, and communicate value clearly and professionally.

With the right message and presentation, ${cleanTopic} can help support stronger brand awareness and more effective outreach.

Best regards,
CryptoHost`;
}

export default function SocialAIPage() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState<ContentType>("blog");

  const output = useMemo(() => {
    return generateContent(contentType, topic);
  }, [contentType, topic]);

  return (
    <div className="min-h-screen bg-[#071923] p-4 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-300/70">
              CryptoHost
            </p>
            <h1 className="text-2xl font-bold">Social Media AI</h1>
            <p className="mt-1 text-sm text-white/60">
              Generate marketing content for posts, promos, scripts, blogs, and email campaigns.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/85"
          >
            Back
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Content Setup</p>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-white/70">
                What do you want to promote?
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Example: CryptoHost Wallet for secure crypto transfers"
                className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-white/70">
                Select content type
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setContentType("facebook")}
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    contentType === "facebook"
                      ? "border border-cyan-400/25 bg-cyan-500/20 text-cyan-100"
                      : "border border-white/10 bg-white/10 text-white/80"
                  }`}
                >
                  Facebook Post
                </button>

                <button
                  type="button"
                  onClick={() => setContentType("twitter")}
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    contentType === "twitter"
                      ? "border border-cyan-400/25 bg-cyan-500/20 text-cyan-100"
                      : "border border-white/10 bg-white/10 text-white/80"
                  }`}
                >
                  X / Twitter Promo
                </button>

                <button
                  type="button"
                  onClick={() => setContentType("tiktok")}
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    contentType === "tiktok"
                      ? "border border-cyan-400/25 bg-cyan-500/20 text-cyan-100"
                      : "border border-white/10 bg-white/10 text-white/80"
                  }`}
                >
                  TikTok Script
                </button>

                <button
                  type="button"
                  onClick={() => setContentType("blog")}
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    contentType === "blog"
                      ? "border border-cyan-400/25 bg-cyan-500/20 text-cyan-100"
                      : "border border-white/10 bg-white/10 text-white/80"
                  }`}
                >
                  Blog Content
                </button>

                <button
                  type="button"
                  onClick={() => setContentType("email")}
                  className={`col-span-2 rounded-2xl px-4 py-3 text-sm ${
                    contentType === "email"
                      ? "border border-cyan-400/25 bg-cyan-500/20 text-cyan-100"
                      : "border border-white/10 bg-white/10 text-white/80"
                  }`}
                >
                  Email Campaign
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">Generated Output</p>

              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(output)}
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs text-white/85"
              >
                Copy
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-[#06131b] p-4">
              <pre className="whitespace-pre-wrap break-words text-sm text-white/85">
                {output}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}