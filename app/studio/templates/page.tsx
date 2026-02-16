"use client";

import { useSession } from "@/lib/session-context";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type TemplateCategory = "TRADITIONAL" | "MODERN" | "RELIGIOUS";

type TemplateItem = {
  id: string;
  name: string;
  slug: string;
  category: TemplateCategory;
  previewImage: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    events: number;
  };
};

type TemplatesResponse = {
  templates: TemplateItem[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function StudioTemplatesPage() {
  const { status, session } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | TemplateCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "TRADITIONAL" as TemplateCategory,
    previewImage: "",
    isActive: true,
  });

  const isAdmin = session?.user.role === "ADMIN";

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/studio/templates?includeInactive=true", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to load templates");
      }

      const data = (await response.json()) as TemplatesResponse;
      setTemplates(data.templates ?? []);
    } catch {
      setError("Unable to load templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") {
      return;
    }

    void loadTemplates();
  }, [loadTemplates, router, status]);

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesSearch =
        query.length === 0 ||
        template.name.toLowerCase().includes(query) ||
        template.slug.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (categoryFilter !== "all" && template.category !== categoryFilter) return false;
      if (statusFilter === "active" && !template.isActive) return false;
      if (statusFilter === "inactive" && template.isActive) return false;
      return true;
    });
  }, [categoryFilter, search, statusFilter, templates]);

  const summary = useMemo(() => {
    const active = templates.filter((template) => template.isActive).length;
    const inactive = templates.length - active;
    const totalUsage = templates.reduce((sum, template) => sum + (template._count?.events ?? 0), 0);
    return { active, inactive, totalUsage };
  }, [templates]);

  async function handleCreateTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);
    setActionError(null);
    setSuccessMessage(null);

    if (!isAdmin) {
      setCreateError("Only admin users can create templates.");
      return;
    }

    const name = formData.name.trim();
    const slug = slugify(formData.slug || formData.name);

    if (name.length < 2) {
      setCreateError("Template name must be at least 2 characters.");
      return;
    }

    if (slug.length < 2) {
      setCreateError("Template slug must be at least 2 characters.");
      return;
    }

    setCreateLoading(true);

    try {
      const response = await fetch("/api/studio/templates", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
          category: formData.category,
          previewImage: formData.previewImage.trim() || undefined,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        setCreateError("Unable to create template. Slug may already exist or payload is invalid.");
        return;
      }

      setFormData({
        name: "",
        slug: "",
        category: "TRADITIONAL",
        previewImage: "",
        isActive: true,
      });
      setSlugEdited(false);
      setIsCreateOpen(false);
      setSuccessMessage("Template created successfully.");
      await loadTemplates();
    } catch {
      setCreateError("Unable to create template. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleToggleTemplate(template: TemplateItem) {
    setActionError(null);
    setSuccessMessage(null);

    if (!isAdmin) {
      setActionError("Only admin users can update template status.");
      return;
    }

    try {
      const response = await fetch(`/api/studio/templates/${template.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !template.isActive }),
      });

      if (!response.ok) {
        setActionError("Unable to update template status.");
        return;
      }

      setSuccessMessage(`Template ${template.isActive ? "deactivated" : "activated"} successfully.`);
      await loadTemplates();
    } catch {
      setActionError("Unable to update template status.");
    }
  }

  async function handleDeleteTemplate(template: TemplateItem) {
    setActionError(null);
    setSuccessMessage(null);

    if (!isAdmin) {
      setActionError("Only admin users can delete templates.");
      return;
    }

    const confirmed = window.confirm(`Delete template \"${template.name}\"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/studio/templates/${template.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        setActionError("Unable to delete template.");
        return;
      }

      setSuccessMessage("Template deleted successfully.");
      await loadTemplates();
    } catch {
      setActionError("Unable to delete template.");
    }
  }

  return (
    <main className="ui-page">
      <div className="ui-page-header">
        <div>
          <h2 className="ui-title">Templates</h2>
          <p className="ui-subtitle">Curate invitation template collections, publishing availability, and usage.</p>
        </div>

        <div className="flex w-full max-w-2xl flex-wrap items-center justify-end gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search template, slug, category"
            className="ui-input max-w-xs"
          />
          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setSuccessMessage(null);
              setActionError(null);
              setIsCreateOpen((value) => !value);
            }}
            className="ui-button-primary"
          >
            {isCreateOpen ? "Close" : "Add Template"}
          </button>
        </div>
      </div>

      {successMessage ? <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p> : null}
      {actionError ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p> : null}
      {!isAdmin ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">You are in STAFF mode. Viewing is enabled, create/edit/delete requires ADMIN role.</p>
      ) : null}

      {isCreateOpen ? (
        <section className="ui-panel mt-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-zinc-800">Create New Template</h3>
            <p className="mt-1 text-sm text-zinc-600">Define a reusable invitation template for upcoming events.</p>
          </div>

          <form className="space-y-4" onSubmit={handleCreateTemplate}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Template Name *</span>
                <input
                  value={formData.name}
                  onChange={(event) => {
                    const value = event.target.value;
                    setFormData((current) => ({
                      ...current,
                      name: value,
                      slug: slugEdited ? current.slug : slugify(value),
                    }));
                  }}
                  placeholder="Timeless Orthodox Gold"
                  className="ui-input"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Slug *</span>
                <input
                  value={formData.slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setFormData((current) => ({ ...current, slug: slugify(event.target.value) }));
                  }}
                  placeholder="timeless-orthodox-gold"
                  className="ui-input"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Category *</span>
                <select
                  value={formData.category}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      category: event.target.value as TemplateCategory,
                    }))
                  }
                  className="ui-select"
                >
                  <option value="TRADITIONAL">Traditional</option>
                  <option value="MODERN">Modern</option>
                  <option value="RELIGIOUS">Religious</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Preview Image URL</span>
                <input
                  type="url"
                  value={formData.previewImage}
                  onChange={(event) => setFormData((current) => ({ ...current, previewImage: event.target.value }))}
                  placeholder="https://..."
                  className="ui-input"
                />
              </label>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) => setFormData((current) => ({ ...current, isActive: event.target.checked }))}
                className="h-4 w-4 rounded border-zinc-300 text-cyan-500 focus:ring-cyan-400"
              />
              Keep template active for event creation
            </label>

            {createError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{createError}</p> : null}

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="ui-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="ui-button-primary"
              >
                {createLoading ? "Creating..." : "Create Template"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Total templates</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">{templates.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Active</p>
          <p className="mt-1 text-xl font-semibold text-cyan-700">{summary.active}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Inactive</p>
          <p className="mt-1 text-xl font-semibold text-violet-700">{summary.inactive}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Used in events</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">{summary.totalUsage}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["TRADITIONAL", "Traditional"],
          ["MODERN", "Modern"],
          ["RELIGIOUS", "Religious"],
        ].map(([value, label]) => {
          const active = categoryFilter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setCategoryFilter(value as "all" | TemplateCategory)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                active
                  ? "bg-gradient-to-r from-cyan-400 to-violet-400 text-white"
                  : "border border-zinc-300 bg-zinc-50 text-zinc-600"
              }`}
            >
              {label}
            </button>
          );
        })}

        {[
          ["all", "Any status"],
          ["active", "Active"],
          ["inactive", "Inactive"],
        ].map(([value, label]) => {
          const active = statusFilter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value as "all" | "active" | "inactive")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                active
                  ? "bg-gradient-to-r from-cyan-400 to-violet-400 text-white"
                  : "border border-zinc-300 bg-zinc-50 text-zinc-600"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-zinc-600">Loading templates...</p>
      ) : error ? (
        <p className="mt-5 text-sm text-red-700">{error}</p>
      ) : (
        <div className="ui-table">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Template</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Used</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="border-t border-zinc-100 align-top hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-800">{template.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">{template.previewImage ? "Has preview image" : "No preview image"}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{template.category}</td>
                    <td className="px-4 py-3 text-zinc-600">{template.slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-medium ${
                          template.isActive
                            ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                            : "border-zinc-200 bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{template._count?.events ?? 0} events</td>
                    <td className="px-4 py-3 text-zinc-600">{formatDate(template.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => void handleToggleTemplate(template)}
                          disabled={!isAdmin}
                          className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-xs text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {template.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteTemplate(template)}
                          disabled={!isAdmin}
                          className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTemplates.length === 0 ? (
            <p className="px-4 py-5 text-sm text-zinc-600">No templates match your filters.</p>
          ) : null}
        </div>
      )}
    </main>
  );
}
