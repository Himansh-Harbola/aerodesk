"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (promptEvent: Event) => {
      promptEvent.preventDefault();
      setEvent(promptEvent as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!event || dismissed) return null;

  return (
    <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <span>Install AeroDesk for faster mobile access and cached bookings.</span>
        <div className="flex gap-2">
          <button
            className="focus-ring inline-flex items-center gap-1 rounded-md bg-[var(--primary)] px-3 py-1.5 font-semibold text-white"
            onClick={async () => {
              await event.prompt();
              setDismissed(true);
            }}
          >
            <Download size={15} />
            Install
          </button>
          <button aria-label="Dismiss install prompt" className="focus-ring rounded-md p-1.5 hover:bg-emerald-100" onClick={() => setDismissed(true)}>
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
