"use client";

import { Button } from "@/components/ui/button";
import { FormEvent, useRef, useState } from "react";

type MediaType = "IMAGE" | "VIDEO";

interface MediaUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { type: MediaType; groupLabel: string; file: File }) => Promise<boolean>;
  isLoading: boolean;
  error?: string;
}

export function MediaUploadDialog({ isOpen, onClose, onSubmit, isLoading, error }: MediaUploadDialogProps) {
  const [formData, setFormData] = useState({
    type: "IMAGE" as MediaType,
    groupLabel: "",
    file: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formData.file) return;
    const isSuccess = await onSubmit({
      type: formData.type,
      groupLabel: formData.groupLabel || "Uncategorized",
      file: formData.file,
    });
    if (isSuccess) {
      setFormData({ type: "IMAGE", groupLabel: "", file: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (!isOpen) return null;

  const acceptTypes = formData.type === "IMAGE" ? "image/*" : "video/*";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Upload {formData.type === "IMAGE" ? "Photo" : "Video"}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Add media files to your wedding gallery
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Media Type *
            </span>
            <select
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as MediaType, file: null }))}
              className="ui-select"
              disabled={isLoading}
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
            <div className="relative rounded-lg border-2 border-dashed px-4 py-8 text-center transition" style={{ borderColor: formData.file ? "var(--primary)" : "var(--border-subtle)" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptTypes}
                onChange={(e) => setFormData((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isLoading}
              />
              <div className="pointer-events-none">
                <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-secondary)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {formData.file ? formData.file.name : "Click or drag to upload"}
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {formData.type === "IMAGE" ? "PNG, JPG up to 10MB" : "MP4, MOV up to 100MB"}
                </p>
              </div>
            </div>
          </label>

          {error && (
            <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.file} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
