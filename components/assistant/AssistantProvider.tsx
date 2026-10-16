"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import AssistantButton from "./AssistantButton";
import AssistantDrawer from "./AssistantDrawer";

export type AssistantMode = "job-match" | "ask";

export interface ProjectRef {
  slug: string;
  name: string;
}

interface AssistantControls {
  open: (mode?: AssistantMode) => void;
}

const AssistantContext = createContext<AssistantControls | null>(null);

/**
 * The Assistant's entry points read this. Null when the Assistant is disabled,
 * so they render nothing — no broken buttons while it is switched off.
 */
export function useAssistant(): AssistantControls | null {
  return useContext(AssistantContext);
}

interface AssistantProviderProps {
  /** Read at build time from ASSISTANT_ENABLED, so the page stays static. */
  enabled: boolean;
  projects: ProjectRef[];
  contactEmail: string;
  children: React.ReactNode;
}

/**
 * Owns the drawer's open state and mode. The drawer stays mounted once opened,
 * so closing it to follow a citation and reopening it keeps the conversation.
 */
export default function AssistantProvider({
  enabled,
  projects,
  contactEmail,
  children,
}: AssistantProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [mode, setMode] = useState<AssistantMode>("job-match");

  const open = useCallback((next?: AssistantMode) => {
    if (next) setMode(next);
    setIsOpen(true);
    setHasOpened(true);
  }, []);

  const controls = useMemo(() => ({ open }), [open]);

  if (!enabled) return <>{children}</>;

  return (
    <AssistantContext.Provider value={controls}>
      {children}
      {!isOpen && <AssistantButton variant="floating" />}
      {hasOpened && (
        <AssistantDrawer
          isOpen={isOpen}
          mode={mode}
          onModeChange={setMode}
          onClose={() => setIsOpen(false)}
          projects={projects}
          contactEmail={contactEmail}
        />
      )}
    </AssistantContext.Provider>
  );
}
