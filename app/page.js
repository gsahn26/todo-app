"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Calendar from "@/components/Calendar";
import TodoCard from "@/components/TodoCard";
import CategoryManager from "@/components/CategoryManager";
import AuthGate from "@/components/AuthGate";

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

function Board({ user, logout }) {
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [categoryId, setCategoryId] = useState("");
  const [memoOpen, setMemoOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const today = todayKey();
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  async function load() {
    const [todosRes, categoriesRes] = await Promise.all([
      supabase.from("todos").select("*").order("id", { ascending: false }),
      supabase.from("categories").select("*").order("id", { ascending: true }),
    ]);
    if (!todosRes.error) setTodos(todosRes.data);
    if (!categoriesRes.error) setCategories(categoriesRes.data);
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  async function createCategory({ name, emoji, color }) {
    await supabase.from("categories").insert({ name, emoji, color, user_id: user.id });
    await load();
  }

  async function addTodo(titleValue, dueDateValue, opts = {}) {
    if (!titleValue.trim()) return;
    await supabase.from("todos").insert({
      title: titleValue.trim(),
      due_date: dueDateValue || null,
      memo: opts.memo || null,
      priority: opts.priority || "medium",
      category_id: opts.categoryId || null,
      user_id: user.id,
    });
    await load();
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await addTodo(title, dueDate, {
      memo,
      priority,
      categoryId: categoryId || null,
    });
    setTitle("");
    setMemo("");
    setMemoOpen(false);
    setDueDate("");
    setPriority("medium");
    setCategoryId("");
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            My Todo Board
          </h1>
          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{user.email}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-zinc-300 px-3 py-1 hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              로그아웃
            </button>
          </div>
        </div>

        <CategoryManager categories={categories} onCreate={createCategory} />

        <form
          onSubmit={handleAdd}
          className="mx-auto mb-8 flex max-w-xl flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAdd(e);
              }
            }}
            placeholder="할 일을 입력하세요"
            rows={2}
            className="w-full basis-full resize-none rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <button
            type="button"
            onClick={() => setMemoOpen((v) => !v)}
            className={`shrink-0 rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${
              memoOpen || memo
                ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                : "border-zinc-200 bg-white text-zinc-500 hover:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            📝 메모{memo ? " ✓" : ""}
          </button>
          {memoOpen && (
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요"
              rows={3}
              autoFocus
              className="w-full basis-full resize-none rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          )}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-2 py-2.5 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-2 py-2.5 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="">카테고리 없음</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
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
                          category={categoryMap[todo.category_id]}
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

export default function Home() {
  return <AuthGate>{({ user, logout }) => <Board user={user} logout={logout} />}</AuthGate>;
}
