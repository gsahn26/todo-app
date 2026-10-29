"use client";

export default function TodoRow({ todo, onToggle, onDelete, deleting, variant = "default" }) {
  const isToday = variant === "today";

  return (
    <li
      className={`flex items-center gap-3 rounded-xl px-2 py-1.5 transition-all duration-300 ease-out ${
        deleting ? "scale-95 opacity-0" : "scale-100 opacity-100"
      } ${isToday ? "bg-white/70 dark:bg-zinc-900/50" : ""}`}
    >
      <input
        type="checkbox"
        checked={!!todo.completed}
        onChange={() => onToggle(todo)}
        className={`h-4 w-4 ${isToday ? "accent-amber-500" : "accent-indigo-600"}`}
      />
      <span
        className={`flex-1 text-sm transition-all duration-300 ${
          todo.completed || deleting
            ? "text-zinc-400 line-through"
            : "text-zinc-900 dark:text-zinc-50"
        }`}
      >
        {todo.title}
      </span>
      {todo.due_date && (
        <span
          className={`rounded-md px-2 py-1 text-xs ${
            isToday
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          마감 {todo.due_date}
        </span>
      )}
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label="삭제"
        disabled={deleting}
        className="text-lg leading-none text-red-500 hover:text-red-700 disabled:opacity-40"
      >
        ×
      </button>
    </li>
  );
}
