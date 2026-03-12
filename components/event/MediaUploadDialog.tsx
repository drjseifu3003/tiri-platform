"use client";

import { Button } from "@/components/ui/button";
import { FormEvent, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

type MediaType = "IMAGE" | "VIDEO";

interface MediaUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onMediaChanged: () => Promise<void>;
  isLoading: boolean;
  error?: string;
  dialogTitle?: string;
  initialType?: MediaType;
  initialGroupLabel?: string;
  lockType?: boolean;
}

export function MediaUploadDialog({
  isOpen,
  onClose,
  eventId,
  onMediaChanged,
  isLoading,
  error,
  dialogTitle,
  initialType = "IMAGE",
  initialGroupLabel = "",
  lockType = false,
}: MediaUploadDialogProps) {
  type UploadItem = {
    localId: string;
    name: string;
    previewUrl: string | null;
    progress: number;
    status: "uploading" | "uploaded" | "failed";
    serverUrl?: string;
    mediaId?: string;
    message?: string;
    deleting?: boolean;
  };

  const [formData, setFormData] = useState({
    type: initialType,
    groupLabel: initialGroupLabel,
    files: [] as File[],
  });
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onClose();
  }

  function uploadSingleFile(file: File, type: MediaType, groupLabel: string) {
    const localId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const previewUrl = type === "IMAGE" ? URL.createObjectURL(file) : null;

    setUploadItems((current) => [
      {
        localId,
        name: file.name,
        previewUrl,
        progress: 0,
        status: "uploading",
      },
      ...current,
    ]);

    const payload = new FormData();
    payload.append("eventId", eventId);
    payload.append("type", type);
    payload.append("groupLabel", groupLabel || "Uncategorized");
    payload.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open("POST", "/api/studio/media/upload");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const progress = Math.round((event.loaded / event.total) * 100);
      setUploadItems((current) => current.map((item) => (item.localId === localId ? { ...item, progress } : item)));
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) return;

      if (xhr.status >= 200 && xhr.status < 300) {
        const json = JSON.parse(xhr.responseText) as { media?: { id: string; url: string } };
        setUploadItems((current) =>
          current.map((item) =>
            item.localId === localId
              ? {
                  ...item,
                  progress: 100,
                  status: "uploaded",
                  serverUrl: json.media?.url,
                  mediaId: json.media?.id,
                }
              : item
          )
        );
        void onMediaChanged();
        return;
      }

      let message = "Upload failed.";
      try {
        const parsed = JSON.parse(xhr.responseText) as { error?: string };
        message = parsed.error || message;
      } catch {
        message = "Upload failed.";
      }

      setUploadItems((current) =>
        current.map((item) => (item.localId === localId ? { ...item, status: "failed", message } : item))
      );
    };

    xhr.send(payload);
  }

  function handleFilesDropped(selectedFiles: File[]) {
    if (selectedFiles.length === 0) return;

    setLocalError(null);
    const type = formData.type;
    const filesToUpload = type === "IMAGE" ? selectedFiles : selectedFiles.slice(0, 1);

    setFormData((current) => ({ ...current, files: filesToUpload }));
    filesToUpload.forEach((file) => uploadSingleFile(file, type, formData.groupLabel));
  }

  async function handleDeleteUploaded(item: UploadItem) {
    if (!item.mediaId) return;

    setUploadItems((current) => current.map((entry) => (entry.localId === item.localId ? { ...entry, deleting: true } : entry)));

    try {
      const response = await fetch(`/api/studio/media/${item.mediaId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        setLocalError("Unable to delete uploaded image.");
        setUploadItems((current) => current.map((entry) => (entry.localId === item.localId ? { ...entry, deleting: false } : entry)));
        return;
      }

      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      setUploadItems((current) => current.filter((entry) => entry.localId !== item.localId));
      await onMediaChanged();
    } catch {
      setLocalError("Unable to delete uploaded image right now.");
      setUploadItems((current) => current.map((entry) => (entry.localId === item.localId ? { ...entry, deleting: false } : entry)));
    }
  }

  if (!isOpen) return null;

  const acceptTypes = formData.type === "IMAGE" ? "image/*" : "video/*";
  const isImage = formData.type === "IMAGE";
  const selectedLabel =
    formData.files.length === 0
      ? "Click or drag to upload"
      : `${formData.files.length} file${formData.files.length === 1 ? "" : "s"} selected`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mb-5">
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {dialogTitle || `Upload ${formData.type === "IMAGE" ? "Photo" : "Video"}`}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Add media files to this event gallery.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Media Type *
            </span>
            <select
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as MediaType, files: [] }))}
              className="ui-select"
              disabled={isLoading || lockType}
            >
              <option value="IMAGE">Photo</option>
              <option value="VIDEO">Video</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Album/Group
            </span>
            <input
              type="text"
              value={formData.groupLabel}
              onChange={(e) => setFormData((prev) => ({ ...prev, groupLabel: e.target.value }))}
              placeholder="e.g. Ceremony, Reception, Photos"
              className="ui-input"
              disabled={isLoading}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {formData.type === "IMAGE" ? "Select Photo" : "Select Video"} *
            </span>
            <div className="relative rounded-lg border-2 border-dashed px-4 py-8 text-center transition" style={{ borderColor: formData.files.length > 0 ? "var(--primary)" : "var(--border-subtle)" }}>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const droppedFiles = Array.from(event.dataTransfer.files || []);
                  handleFilesDropped(droppedFiles);
                }}
                className="absolute inset-0"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptTypes}
                multiple={isImage}
                onChange={(e) => {
                  const selected = Array.from(e.target.files || []);
                  handleFilesDropped(selected);
                }}
                className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                disabled={isLoading}
              />
              <div className="pointer-events-none">
                <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-secondary)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {selectedLabel}
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {formData.type === "IMAGE" ? "PNG, JPG, WEBP, GIF up to 10MB each (multiple allowed)" : "MP4, MOV, WEBM up to 100MB"}
                </p>
              </div>
            </div>
          </label>

          {uploadItems.length > 0 ? (
            <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="mb-2 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                Uploaded / Uploading ({uploadItems.length})
              </p>
              <div className="space-y-2">
                {uploadItems.map((item) => (
                  <div key={item.localId} className="flex items-center gap-3 rounded-md border px-2 py-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                      {item.previewUrl ? (
                        <img src={item.previewUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded" style={{ background: "var(--secondary-lighter)" }}>
                        <div className="h-full transition-all" style={{ width: `${item.progress}%`, background: "var(--accent)" }} />
                      </div>
                      <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        {item.status === "uploaded" ? "Uploaded" : item.status === "failed" ? item.message || "Failed" : `Uploading... ${item.progress}%`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          void handleDeleteUploaded(item);
                        }}
                        disabled={!item.mediaId || item.deleting}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-60"
                        style={{ borderColor: "var(--error)", color: "var(--error)", background: "var(--surface)" }}
                        aria-label="Delete uploaded image"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {(error || localError) && (
            <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>
              {localError || error}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Close
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
