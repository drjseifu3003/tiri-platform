import { ExternalLink, Eye, FolderOpen, Trash2 } from "lucide-react";

type MediaItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  groupLabel: string | null;
  createdAt: string;
  name: string;
  folder: string;
};

type MediaBrowserItem =
  | {
    kind: "folder";
    id: string;
    name: string;
    fileCount: number;
    lastModified?: string;
  }
  | {
    kind: "file";
    id: string;
    file: MediaItem;
  };

type EventMediaSectionProps = {
  mediaCount: number;
  mediaFormError: string | null;
  mediaFormSuccess: string | null;
  mediaBrowserItems: MediaBrowserItem[];
  selectedMediaFolder: string | null;
  mediaViewMode: "grid" | "list";
  isCompletedEvent: boolean;
  mediaDeleteLoadingId: string | null;
  formatDateTime: (value: string) => string;
  onUploadMedia: () => void;
  onBackToFolders: () => void;
  onSetMediaViewMode: (mode: "grid" | "list") => void;
  onOpenFolder: (folder: string) => void;
  onPreviewMedia: (item: MediaItem) => void;
  onDeleteMedia: (mediaId: string) => void;
};

export function EventMediaSection({
  mediaCount,
  mediaFormError,
  mediaFormSuccess,
  mediaBrowserItems,
  selectedMediaFolder,
  mediaViewMode,
  isCompletedEvent,
  mediaDeleteLoadingId,
  formatDateTime,
  onUploadMedia,
  onBackToFolders,
  onSetMediaViewMode,
  onOpenFolder,
  onPreviewMedia,
  onDeleteMedia,
}: EventMediaSectionProps) {
  return (
    <section className="mt-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Media Gallery</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {mediaCount} file{mediaCount !== 1 ? "s" : ""} uploaded
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onUploadMedia} className="ui-button-primary h-10">
            Upload Media
          </button>
        </div>
      </div>

      {mediaFormError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{mediaFormError}</p> : null}
      {mediaFormSuccess ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{mediaFormSuccess}</p> : null}

      {mediaBrowserItems.length === 0 ? (
        <p className="rounded-lg border px-4 py-5 text-sm text-zinc-600" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          No folders or files uploaded yet.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
              <span style={{ color: "var(--text-secondary)" }}>Path:</span>
              <button
                type="button"
                onClick={onBackToFolders}
                className="rounded-md border px-2.5 py-1.5 text-xs font-medium"
                style={{
                  borderColor: selectedMediaFolder ? "var(--border-subtle)" : "var(--primary)",
                  background: selectedMediaFolder ? "var(--surface)" : "var(--primary)",
                  color: selectedMediaFolder ? "var(--text-primary)" : "white",
                }}
              >
                My Drive
              </button>
              {selectedMediaFolder ? <span className="text-xs" style={{ color: "var(--text-secondary)" }}>/ {selectedMediaFolder}</span> : null}
            </div>

            <div className="flex items-center gap-2">
              {selectedMediaFolder ? (
                <button
                  type="button"
                  onClick={onBackToFolders}
                  className="rounded-md border px-2.5 py-1.5 text-xs font-medium"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface)" }}
                >
                  Back to folders
                </button>
              ) : null}
              <div className="inline-flex rounded-md border p-0.5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                <button
                  type="button"
                  onClick={() => onSetMediaViewMode("list")}
                  className="rounded px-2.5 py-1 text-xs font-medium"
                  style={{ color: mediaViewMode === "list" ? "white" : "var(--text-primary)", background: mediaViewMode === "list" ? "var(--primary)" : "transparent" }}
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => onSetMediaViewMode("grid")}
                  className="rounded px-2.5 py-1 text-xs font-medium"
                  style={{ color: mediaViewMode === "grid" ? "white" : "var(--text-primary)", background: mediaViewMode === "grid" ? "var(--primary)" : "transparent" }}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>

          {mediaViewMode === "list" ? (
            <div className="ui-table overflow-hidden">
              <div className="grid gap-3 p-3 md:hidden">
                {mediaBrowserItems.map((item) => (
                  <article key={`${item.id}-mobile`} className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                    <p className="font-medium break-all" style={{ color: "var(--text-primary)" }}>{item.kind === "folder" ? item.name : item.file.name}</p>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {item.kind === "folder" ? `Folder (${item.fileCount})` : item.file.type === "IMAGE" ? "Photo" : "Video"}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {item.kind === "folder" ? (item.lastModified ? formatDateTime(item.lastModified) : "-") : formatDateTime(item.file.createdAt)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {item.kind === "folder" ? (
                        <button
                          type="button"
                          onClick={() => onOpenFolder(item.name)}
                          className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium"
                          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                        >
                          Open folder
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onPreviewMedia(item.file)}
                            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium"
                            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                          >
                            Preview
                          </button>
                          <a
                            href={item.file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium"
                            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                          >
                            Open
                          </a>
                          <button
                            type="button"
                            onClick={() => onDeleteMedia(item.file.id)}
                            disabled={mediaDeleteLoadingId === item.file.id || isCompletedEvent}
                            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium disabled:opacity-60"
                            style={{ borderColor: "#f6b1be", color: "#b32543", background: "#fff0f4" }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left text-sm">
                  <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                    <tr>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Name</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Type</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Modified</th>
                      <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mediaBrowserItems.map((item) => (
                      <tr key={item.id} className="border-t" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                        <td className="px-4 py-3">
                          {item.kind === "folder" ? (
                            <button type="button" onClick={() => onOpenFolder(item.name)} className="flex items-center gap-2 text-left text-zinc-700 hover:underline">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" style={{ color: "var(--primary)" }} aria-hidden>
                                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                              </svg>
                              <span>{item.name}</span>
                            </button>
                          ) : (
                            <button type="button" onClick={() => onPreviewMedia(item.file)} className="flex items-center gap-2 text-left hover:underline" style={{ color: "var(--text-primary)" }}>
                              {item.file.type === "VIDEO" ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" style={{ color: "var(--text-secondary)" }} aria-hidden>
                                  <rect x="3" y="5" width="14" height="14" rx="2" />
                                  <path d="m17 10 4-2v8l-4-2z" />
                                </svg>
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" style={{ color: "var(--text-secondary)" }} aria-hidden>
                                  <rect x="3" y="4" width="18" height="16" rx="2" />
                                  <circle cx="9" cy="10" r="1.5" />
                                  <path d="m7 17 4-4 3 3 3-4 3 5" />
                                </svg>
                              )}
                              <span className="break-all">{item.file.name}</span>
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.kind === "folder" ? `Folder (${item.fileCount})` : item.file.type === "IMAGE" ? "Photo" : "Video"}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.kind === "folder" ? (item.lastModified ? formatDateTime(item.lastModified) : "-") : formatDateTime(item.file.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          {item.kind === "folder" ? (
                            <button
                              type="button"
                              onClick={() => onOpenFolder(item.name)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                              aria-label="Open folder"
                              title="Open folder"
                            >
                              <FolderOpen size={14} />
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onPreviewMedia(item.file)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                                style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                                aria-label="Preview media"
                                title="Preview"
                              >
                                <Eye size={14} />
                              </button>
                              <a
                                href={item.file.url}
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
                                onClick={() => onDeleteMedia(item.file.id)}
                                disabled={mediaDeleteLoadingId === item.file.id || isCompletedEvent}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-60"
                                style={{ borderColor: "#f6b1be", color: "#b32543", background: "#fff0f4" }}
                                aria-label="Delete media"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mediaBrowserItems.map((item) => (
                <div key={item.id} className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                  {item.kind === "folder" ? (
                    <button type="button" onClick={() => onOpenFolder(item.name)} className="w-full text-left">
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" style={{ color: "var(--primary)" }} aria-hidden>
                          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                        </svg>
                        <p className="truncate text-sm font-medium text-zinc-700">{item.name}</p>
                      </div>
                      <p className="mt-3 text-xs text-zinc-500">{item.fileCount} file{item.fileCount !== 1 ? "s" : ""}</p>
                      <p className="mt-1 text-xs text-zinc-500">{item.lastModified ? formatDateTime(item.lastModified) : "-"}</p>
                    </button>
                  ) : (
                    <div>
                      <button type="button" onClick={() => onPreviewMedia(item.file)} className="block w-full">
                        <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-md border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                          {item.file.type === "IMAGE" ? (
                            <img src={item.file.url} alt={item.file.name} className="h-full w-full object-cover" />
                          ) : (
                            <video src={item.file.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                          )}
                        </div>
                      </button>
                      <p className="mt-2 truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.file.name}</p>
                      <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>{formatDateTime(item.file.createdAt)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onPreviewMedia(item.file)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                          aria-label="Preview media"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <a
                          href={item.file.url}
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
                          onClick={() => onDeleteMedia(item.file.id)}
                          disabled={mediaDeleteLoadingId === item.file.id || isCompletedEvent}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-60"
                          style={{ borderColor: "#f6b1be", color: "#b32543", background: "#fff0f4" }}
                          aria-label="Delete media"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
