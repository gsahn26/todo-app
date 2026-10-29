"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Calendar from "@/components/Calendar";
import TodoCard from "@/components/TodoCard";

function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const COLUMNS = [
  {
    key: "upcoming",
    title: "예정",
    accent: "indigo",
    headerClass: "bg-indigo-600",
    filter: (todo, today) => !todo.completed && todo.due_date !== today,
  },
  {
    key: "today",
    title: "오늘",
    accent: "amber",
    headerClass: "bg-amber-500",
    filter: (todo, today) => !todo.completed && todo.due_date === today,
  },
  {
    key: "done",
    title: "완료",
    accent: "emerald",
    headerClass: "bg-emerald-600",
    filter: (todo) => todo.completed,
  },
];

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const today = todayKey();

  async function load() {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("id", { ascending: false });
    if (!error) setTodos(data);
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  async function addTodo(titleValue, dueDateValue) {
    if (!titleValue.trim()) return;
    await supabase.from("todos").insert({
      title: titleValue.trim(),
      due_date: dueDateValue || null,
    });
    await load();
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await addTodo(title, dueDate);
    setTitle("");
    setDueDate("");
    setSubmitting(false);
  }

  async function toggleTodo(todo) {
    await supabase
      .from("todos")
      .update({ completed: !todo.completed })
      .eq("id", todo.id);
    await load();
  }

  async function deleteTodo(id) {
    setDeletingIds((prev) => new Set(prev).add(id));
    setTimeout(async () => {
      await supabase.from("todos").delete().eq("id", id);
      await load();
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10 dark:bg-black">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          My Todo Board
        </h1>

        <form
          onSubmit={handleAdd}
          className="mx-auto mb-8 flex max-w-xl gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일을 입력하세요"
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            추가
          </button>
        </form>

        {!loaded ? (
          <p className="py-8 text-center text-sm text-zinc-400">
            불러오는 중...
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {COLUMNS.map((col) => {
              const items = todos.filter((t) => col.filter(t, today));
              return (
                <div
                  key={col.key}
                  className="flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div
                    className={`flex items-center justify-between rounded-t-2xl px-4 py-3 text-white ${col.headerClass}`}
                  >
                    <span className="text-sm font-bold">{col.title}</span>
                    <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-semibold">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    {items.length === 0 ? (
                      <p className="py-6 text-center text-xs text-zinc-400">
                        비어 있어요
                      </p>
                    ) : (
                      items.map((todo) => (
                        <TodoCard
                          key={todo.id}
                          todo={todo}
                          onToggle={toggleTodo}
                          onDelete={deleteTodo}
                          deleting={deletingIds.has(todo.id)}
                          accent={col.accent}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Calendar todos={todos} onAddTodo={addTodo} />
      </div>
    </div>
  );
}
