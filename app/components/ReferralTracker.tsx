"use client";

import { useEffect } from "react";

export default function ReferralTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref) {
      localStorage.setItem("referrer", ref);
      console.log("Referrer saved:", ref);
    }
  }, []);

  return null;
}