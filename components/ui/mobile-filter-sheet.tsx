"use client";

import { ReactNode, useEffect, useState } from "react";

type MobileFilterSheetProps = {
  title?: string;
  triggerLabel?: string;
  children: ReactNode;
};

export function MobileFilterSheet({
  title = "Filters",
  triggerLabel = "Filters",
  children,
}: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium md:hidden"
        style={{
          borderColor: "var(--border-subtle)",
          background: "var(--surface)",
          color: "var(--text-primary)",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="10" y1="18" x2="14" y2="18" />
        </svg>
        {triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/35"
            aria-label="Close filters"
          />
          <aside
            className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto border-l p-4 shadow-2xl"
            style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
                aria-label="Close filters"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">{children}</div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ui-button-primary mt-5 w-full"
            >
              Apply
            </button>
          </aside>
        </div>
      ) : null}
    </>
  );
}
