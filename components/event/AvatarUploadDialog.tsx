"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

interface AvatarUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  isLoading: boolean;
  currentAvatarUrl?: string;
  eventTitle: string;
  error?: string;
}

export function AvatarUploadDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  currentAvatarUrl,
  eventTitle,
  error,
}: AvatarUploadDialogProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(error);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a valid image file (JPG, PNG, or WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setUploadError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.background = "var(--surface-muted)";
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.background = "var(--surface)";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.background = "var(--surface)";
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    try {
      await onSubmit(selectedFile);
    } catch {
      setUploadError("Failed to upload avatar");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mb-5">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Event Avatar
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Upload a photo for {eventTitle}
          </p>
        </div>

        <div className="space-y-4">
          {preview && (
            <div className="flex justify-center">
              <img
                src={preview}
                alt="Avatar preview"
                className="h-32 w-32 rounded-lg object-cover"
                style={{ borderColor: "var(--border-subtle)" }}
              />
            </div>
          )}

          <div
            className="rounded-lg border-2 border-dashed p-6 text-center transition cursor-pointer"
            style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleInputChange}
              className="hidden"
            />
            <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-secondary)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {selectedFile ? selectedFile.name : "Click or drag image here"}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
              JPG, PNG or WebP · Max 5MB
            </p>
          </div>

          {(uploadError || error) && (
            <div className="rounded-lg p-3 text-sm" style={{ background: "var(--error)" + "1A", color: "var(--error)", borderLeft: "3px solid var(--error)" }}>
              {uploadError || error}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedFile || isLoading} className="ui-button-primary">
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}
