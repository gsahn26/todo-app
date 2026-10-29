"use client";

const PRIORITY_MAP = {
  high: { label: "높음", className: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300" },
  medium: { label: "보통", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  low: { label: "낮음", className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
};

export default function TodoCard({ todo, category, onToggle, onDelete, deleting, accent = "indigo" }) {
  const accentMap = {
    indigo: "accent-indigo-600",
    amber: "accent-amber-500",
    emerald: "accent-emerald-600",
  };
  const badgeMap = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
  };
  const priority = PRIORITY_MAP[todo.priority] || PRIORITY_MAP.medium;

  return (
    <div
      className={`flex items-start gap-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition-all duration-300 ease-out dark:border-zinc-800 dark:bg-zinc-900 ${
        deleting ? "scale-95 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      <input
        type="checkbox"
        checked={!!todo.completed}
        onChange={() => onToggle(todo)}
        className={`mt-0.5 h-4 w-4 shrink-0 ${accentMap[accent]}`}
      />
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm break-words ${
            todo.completed || deleting
              ? "text-zinc-400 line-through"
              : "text-zinc-900 dark:text-zinc-50"
          }`}
        >
          {todo.title}
        </p>
        {todo.memo && (
          <p className="mt-0.5 break-words text-xs text-zinc-400 dark:text-zinc-500">
            {todo.memo}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {category && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] text-white"
              style={{ backgroundColor: category.color }}
            >
              <span>{category.emoji}</span>
              <span>{category.name}</span>
            </span>
          )}
          <span className={`rounded-md px-1.5 py-0.5 text-[11px] ${priority.className}`}>
            {priority.label}
          </span>
          {todo.due_date && (
            <span className={`rounded-md px-1.5 py-0.5 text-[11px] ${badgeMap[accent]}`}>
              마감 {todo.due_date}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label="삭제"
        disabled={deleting}
        className="shrink-0 text-lg leading-none text-red-500 hover:text-red-700 disabled:opacity-40"
      >
        ×
      </button>
    </div>
  );
}
