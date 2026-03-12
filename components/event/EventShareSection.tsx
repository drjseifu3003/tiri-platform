"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

type SocialPlatform = "INSTAGRAM" | "FACEBOOK" | "TIKTOK";
type MediaKind = "IMAGE" | "VIDEO";

interface EventShareSectionProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  eventDate: string;
  eventLocation?: string;
  initialText?: string;
}

function labelForSocialPlatform(platform: SocialPlatform) {
  const labels: Record<SocialPlatform, string> = {
    INSTAGRAM: "Instagram",
    FACEBOOK: "Facebook",
    TIKTOK: "TikTok",
  };
  return labels[platform];
}

function socialPlatformIcon(platform: SocialPlatform, className = "h-6 w-6") {
  if (platform === "INSTAGRAM") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (platform === "FACEBOOK") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.2 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5h1.7V3.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.1V13h2.7v8h3.4z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.9 6.6c-1.2-.8-2-2.1-2.2-3.6h-2.9v12.4c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.2 0 .4 0 .6.1V10.6c-.2 0-.4-.1-.6-.1-2.7 0-4.9 2.2-4.9 4.9s2.2 4.9 4.9 4.9 4.9-2.2 4.9-4.9V9.1c1 .8 2.3 1.2 3.6 1.2V7.4c-.5 0-1-.2-1.4-.8z" />
    </svg>
  );
}

function socialMediaRequirement(platform: SocialPlatform, kind: MediaKind | null) {
  if (platform === "INSTAGRAM") {
    return kind === "VIDEO"
      ? "Instagram video: 9:16 recommended, max 60s for feed, keep under 100 MB for quick upload."
      : "Instagram image: 1080x1350 (4:5) recommended, JPG/PNG, keep under 10 MB.";
  }

  if (platform === "FACEBOOK") {
    return kind === "VIDEO"
      ? "Facebook video: 1080x1080 or 1080x1350 recommended, MP4/MOV, keep under 200 MB for reliable upload."
      : "Facebook image: 1200x630 minimum for strong preview, JPG/PNG, keep under 10 MB.";
  }

  return kind === "VIDEO"
    ? "TikTok video: 9:16 vertical, MP4/MOV/WEBM, keep under 287 MB and ideally 10-60 seconds."
    : "TikTok photo mode: 1080x1920 recommended, JPG/PNG, keep under 10 MB.";
}

export function EventShareSection({
  isOpen,
  onClose,
  eventTitle,
  eventDate,
  eventLocation,
  initialText,
}: EventShareSectionProps) {
  const [platform, setPlatform] = useState<SocialPlatform>("INSTAGRAM");
  const [shareText, setShareText] = useState(initialText || "");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadKind, setUploadKind] = useState<MediaKind | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleUploadChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setUploadError("Only image or video files are allowed.");
      return;
    }

    const maxBytes = isImage ? 10 * 1024 * 1024 : 200 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`File too large. ${isImage ? "Image" : "Video"} must be under ${isImage ? "10 MB" : "200 MB"}.`);
      return;
    }

    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview);
    }

    setUploadFile(file);
    setUploadKind(isImage ? "IMAGE" : "VIDEO");
    setUploadPreview(URL.createObjectURL(file));
  }

  async function copyToClipboard() {
    const payload = [
      shareText.trim(),
      uploadFile ? `Media file: ${uploadFile.name}` : "",
      uploadKind ? `Media type: ${uploadKind}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (!payload) return;

    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setUploadError("Unable to copy to clipboard");
    }
  }

  function openSocialPlatform() {
    const urls: Record<SocialPlatform, string> = {
      INSTAGRAM: "https://www.instagram.com/",
      FACEBOOK: "https://www.facebook.com/",
      TIKTOK: "https://www.tiktok.com/upload",
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer");
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border bg-white"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="border-b px-6 py-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "var(--primary-lighter)", color: "var(--primary)" }}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C9.539 12.487 10.88 12 12 12s2.461.487 3.316 1.342m0 0a9 9 0 10-11.632 0m11.632 0a9 9 0 11-11.632 0" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  Share {eventTitle}
                </h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Create and publish to social media.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded p-1 transition hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Close dialog"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
              Select Platform
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["INSTAGRAM", "FACEBOOK", "TIKTOK"] as SocialPlatform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className="flex flex-col items-center gap-2 rounded-lg border p-3 transition"
                  style={{
                    borderColor: platform === p ? "var(--primary-light)" : "var(--border-subtle)",
                    background: platform === p ? "var(--primary-lighter)" : "var(--surface)",
                    color: "var(--text-primary)",
                  }}
                >
                  {socialPlatformIcon(p, "h-6 w-6")}
                  <span className="text-sm font-medium">{labelForSocialPlatform(p)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              Caption
            </label>
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              placeholder="Enter your post caption..."
              className="ui-textarea"
              style={{ borderColor: "var(--border-subtle)" }}
              rows={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              Media (Optional)
            </label>
            <div className="rounded-lg border-2 border-dashed p-6 text-center" style={{ borderColor: "var(--border-subtle)" }}>
              {uploadPreview ? (
                <div className="space-y-3">
                  <div className="mx-auto h-32 w-32 overflow-hidden rounded-lg">
                    {uploadKind === "IMAGE" ? (
                      <img src={uploadPreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <video src={uploadPreview} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{uploadFile?.name}</p>
                    <p className="text-xs text-slate-600">
                      {(uploadFile!.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setUploadFile(null);
                      setUploadKind(null);
                      if (uploadPreview) {
                        URL.revokeObjectURL(uploadPreview);
                      }
                      setUploadPreview(null);
                    }}
                    className="text-sm font-medium"
                    style={{ color: "var(--primary)" }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    onChange={handleUploadChange}
                    accept="image/*,video/*"
                    className="hidden"
                    id="media-upload"
                  />
                  <label htmlFor="media-upload" className="cursor-pointer">
                    <svg className="mx-auto h-8 w-8" style={{ color: "var(--text-tertiary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Click to upload media</p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>or drag and drop</p>
                  </label>
                </div>
              )}
            </div>
            {uploadError && (
              <p className="mt-2 text-sm" style={{ color: "var(--error)" }}>{uploadError}</p>
            )}
            <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              {socialMediaRequirement(platform, uploadKind)}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t px-6 py-4" style={{ borderColor: "var(--border-subtle)" }}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={copyToClipboard}
            disabled={!shareText.trim()}
          >
            {copied ? "Copied!" : "Copy Content"}
          </Button>
          <Button
            onClick={openSocialPlatform}
            className="ui-button-primary"
          >
            Open {labelForSocialPlatform(platform)}
          </Button>
        </div>
      </div>
    </div>
  );
}
