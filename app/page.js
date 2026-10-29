"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await supabase.from("todos").insert({ title: title.trim() });
    setTitle("");
    await load();
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
    await supabase.from("todos").delete().eq("id", id);
    await load();
  }

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          내 Todo 앱
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Supabase(클라우드 DB)에 저장됩니다.
        </p>

        <form onSubmit={handleAdd} className="mb-6 flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일을 입력하세요"
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            추가
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {!loaded ? (
            <p className="p-8 text-center text-sm text-zinc-400">
              불러오는 중...
            </p>
          ) : todos.length === 0 ? (
            <p className="p-8 text-center text-sm text-zinc-400">
              할 일이 없습니다. 위에서 추가해보세요.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    checked={!!todo.completed}
                    onChange={() => toggleTodo(todo)}
                    className="h-4 w-4"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      todo.completed
                        ? "text-zinc-400 line-through"
                        : "text-zinc-900 dark:text-zinc-50"
                    }`}
                  >
                    {todo.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteTodo(todo.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
