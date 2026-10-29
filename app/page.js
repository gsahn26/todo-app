"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Calendar from "@/components/Calendar";
import TodoRow from "@/components/TodoRow";

function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const todayTodos = todos.filter((todo) => todo.due_date === todayKey());

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
    <div className="flex min-h-screen justify-center bg-zinc-100 px-4 py-16 dark:bg-black">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-5 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            My Todo
          </h1>

          <form onSubmit={handleAdd} className="mb-5 flex gap-2">
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

          {loaded && todayTodos.length > 0 && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                  오늘
                </span>
                <span className="text-xs text-amber-700 dark:text-amber-300">
                  {todayTodos.length}개의 할 일이 오늘 마감이에요
                </span>
              </div>
              <ul className="flex flex-col gap-1">
                {todayTodos.map((todo) => (
                  <TodoRow
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    deleting={deletingIds.has(todo.id)}
                    variant="today"
                  />
                ))}
              </ul>
            </div>
          )}

          {!loaded ? (
            <p className="py-8 text-center text-sm text-zinc-400">
              불러오는 중...
            </p>
          ) : todos.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">
              할 일이 없습니다. 위에서 추가해보세요.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {todos.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  deleting={deletingIds.has(todo.id)}
                />
              ))}
            </ul>
          )}
        </div>

        <Calendar todos={todos} onAddTodo={addTodo} />
      </div>
    </div>
  );
}
