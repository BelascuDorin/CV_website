"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
 *
 * Opening adds a history entry for the same URL, so the phone's Back button
 * closes the drawer instead of leaving the site. Every close goes back through
 * that entry, which keeps the history stack exactly as the visitor found it.
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

  /** Whether the drawer's history entry is currently on the stack. */
  const hasHistoryEntry = useRef(false);
  /** Runs once the drawer has closed, e.g. scrolling to a cited Project. */
  const afterClose = useRef<(() => void) | null>(null);

  const open = useCallback((next?: AssistantMode) => {
    if (next) setMode(next);
    setIsOpen(true);
    setHasOpened(true);
    if (!hasHistoryEntry.current) {
      window.history.pushState(null, "", window.location.href);
      hasHistoryEntry.current = true;
    }
  }, []);

  const close = useCallback((then?: () => void) => {
    afterClose.current = then ?? null;
    if (hasHistoryEntry.current) {
      // The popstate handler below finishes the close.
      window.history.back();
    } else {
      setIsOpen(false);
      afterClose.current?.();
      afterClose.current = null;
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      if (!hasHistoryEntry.current) return;
      hasHistoryEntry.current = false;
      setIsOpen(false);
      const then = afterClose.current;
      afterClose.current = null;
      // After the browser has restored the scroll position for this entry.
      if (then) requestAnimationFrame(then);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
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
          onClose={close}
          projects={projects}
          contactEmail={contactEmail}
        />
      )}
    </AssistantContext.Provider>
  );
}
