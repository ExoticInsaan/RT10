"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { firstName } from "@/lib/profile";

const STORAGE_KEY = "toppershelf-study-buddy-dismissed";

const studyMessages = [
  "Let's find your next study resource! 📚",
  "Important questions, notes and PDFs, all in one place!",
  "Ready to ace your exams? 💙",
  "Pick your course and semester to get started!",
  "Your next study session starts here! ✨",
];

/** Owl mascot in the corner of the home page. Greets the signed-in student by name. */
export default function StudyBuddy() {
  const { profile } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(-1);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      // Storage unavailable: just show the buddy.
    }
    Promise.resolve().then(() => {
      setIsVisible(!dismissed);
      setIsReady(true);
    });
  }, []);

  if (!isReady) return null;

  const name = firstName(profile?.name);
  const greeting = name ? `Welcome, ${name} !!` : "Welcome !!";

  const dismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Dismissal still holds for this visit.
    }
  };

  const show = () => {
    setMessageIndex(-1);
    setIsVisible(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Works for this visit either way.
    }
  };

  if (!isVisible) {
    return (
      <button className="study-buddy-restore" type="button" onClick={show}>
        Show study buddy
      </button>
    );
  }

  return (
    <aside className="study-buddy" aria-label="Toppershelf study buddy">
      <div className="study-buddy__bubble" aria-live="polite">
        <button
          className="study-buddy__close"
          type="button"
          aria-label="Dismiss study buddy"
          onClick={dismiss}
        >
          ×
        </button>
        <p className="study-buddy__title">
          {messageIndex === -1 ? greeting : studyMessages[messageIndex]}
        </p>
      </div>

      <button
        className="study-buddy__mascot"
        type="button"
        aria-label="Hear another message from your study buddy"
        onClick={() => setMessageIndex((current) => (current + 1) % studyMessages.length)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/toppershelf-owl.png" alt="" width={200} height={200} draggable={false} />
      </button>
    </aside>
  );
}
