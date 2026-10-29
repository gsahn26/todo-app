"use client";

import { useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Calendar({ todos }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const todosByDate = {};
  for (const todo of todos) {
    if (!todo.due_date) continue;
    const key = todo.due_date;
    if (!todosByDate[key]) todosByDate[key] = [];
    todosByDate[key].push(todo);
  }

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toDateKey(new Date());

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function goPrevMonth() {
    setCursor(new Date(year, month - 1, 1));
  }
  function goNextMonth() {
    setCursor(new Date(year, month + 1, 1));
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          ◀
        </button>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {year}년 {month + 1}월
        </h2>
        <button
          type="button"
          onClick={goNextMonth}
          className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-400">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const key = toDateKey(new Date(year, month, day));
          const dayTodos = todosByDate[key] || [];
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              className={`min-h-16 rounded-lg border px-1 py-1 text-left align-top ${
                isToday
                  ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                  : "border-transparent"
              }`}
            >
              <div
                className={`mb-1 text-xs ${
                  isToday
                    ? "font-bold text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {day}
              </div>
              <div className="flex flex-col gap-0.5">
                {dayTodos.slice(0, 3).map((todo) => (
                  <div
                    key={todo.id}
                    title={todo.title}
                    className={`truncate rounded px-1 py-0.5 text-[10px] ${
                      todo.completed
                        ? "bg-zinc-100 text-zinc-400 line-through dark:bg-zinc-800"
                        : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                    }`}
                  >
                    {todo.title}
                  </div>
                ))}
                {dayTodos.length > 3 && (
                  <div className="text-[10px] text-zinc-400">
                    +{dayTodos.length - 3}개 더
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
