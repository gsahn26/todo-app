"use client";

import { useState } from "react";

const PRESET_COLORS = ["#7c6cf2", "#f97316", "#10b981", "#ef4444", "#3b82f6", "#eab308"];

export default function CategoryManager({ categories, onCreate }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📌");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onCreate({ name: name.trim(), emoji, color });
    setName("");
    setEmoji("📌");
    setColor(PRESET_COLORS[0]);
    setSubmitting(false);
    setOpen(false);
  }

  return (
    <div className="mx-auto mb-4 flex max-w-xl flex-wrap items-center gap-2">
      {categories.map((c) => (
        <span
          key={c.id}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white"
          style={{ backgroundColor: c.color }}
        >
          <span>{c.emoji}</span>
          <span>{c.name}</span>
        </span>
      ))}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-dashed border-zinc-300 px-2.5 py-1 text-xs text-zinc-500 hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400"
      >
        + 카테고리
      </button>

      {open && (
        <form
          onSubmit={handleCreate}
          className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="w-12 rounded-lg border border-zinc-200 px-2 py-1.5 text-center text-sm dark:border-zinc-700 dark:bg-zinc-800"
            maxLength={2}
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="카테고리 이름"
            className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <div className="flex gap-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full ${color === c ? "ring-2 ring-offset-1 ring-zinc-900 dark:ring-zinc-100" : ""}`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            만들기
          </button>
        </form>
      )}
    </div>
  );
}
