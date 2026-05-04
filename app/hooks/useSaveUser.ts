"use client";

import { useEffect } from "react";

export default function useSaveUser() {
  useEffect(() => {
    async function saveUser() {
      try {
        let userId = localStorage.getItem("user_id");

        if (!userId) {
          userId =
            "USER-" + Math.random().toString(36).slice(2, 8);
          localStorage.setItem("user_id", userId);
        }

        const referrer =
          localStorage.getItem("referrer") || null;

        const alreadySaved =
          localStorage.getItem("user_saved");

        if (!alreadySaved) {
          await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              wallet: userId,
              referrer,
            }),
          });

          localStorage.setItem("user_saved", "true");
        }
      } catch (err) {
        console.error("Save user failed");
      }
    }

    saveUser();
  }, []);
}