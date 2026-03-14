import { ExternalLink, Trash2 } from "lucide-react";

type MediaPreviewItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  name: string;
  folder: string;
};

type MediaPreviewDialogProps = {
  item: MediaPreviewItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
};

export function MediaPreviewDialog({ item, isDeleting, onClose, onDelete }: MediaPreviewDialogProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold" style={{ color: "var(--primary)" }}>{item.name}</p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{item.folder}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
              aria-label="Open media in new tab"
              title="Open"
            >
              <ExternalLink size={14} />
            </a>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              disabled={isDeleting}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-60"
              style={{ borderColor: "#f6b1be", color: "#b32543", background: "#fff0f4" }}
              aria-label="Delete media"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 items-center rounded-md border px-2.5 text-xs font-medium"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface)" }}
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex max-h-[72vh] items-center justify-center overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
          {item.type === "IMAGE" ? (
            <img src={item.url} alt={item.name} className="max-h-[72vh] w-auto max-w-full object-contain" />
          ) : (
            <video src={item.url} controls className="max-h-[72vh] w-full bg-black object-contain" />
          )}
        </div>
      </div>
    </div>
  );
}
