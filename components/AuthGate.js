"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, login, signUp, logout, subscribeAuthChange } from "@/lib/auth";

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function refresh() {
      const u = await getCurrentUser();
      setUser(u);
      setChecked(true);
    }
    refresh();
    return subscribeAuthChange(refresh);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const data = await signUp(email, password);
        if (!data.session) {
          setInfo("가입 확인 메일을 보냈어요. 메일함에서 인증 링크를 눌러주세요.");
          setSubmitting(false);
          return;
        }
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || "오류가 발생했습니다.");
    }
    setSubmitting(false);
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-black">
        <p className="text-sm text-zinc-400">확인 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 dark:bg-black">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-1 text-center text-xl font-bold text-zinc-900 dark:text-zinc-50">
            My Todo Board
          </h1>
          <p className="mb-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {mode === "login" ? "로그인하고 내 할 일을 관리하세요" : "회원가입하고 시작하세요"}
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 (6자 이상)"
              className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                {info}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {mode === "login" ? "로그인" : "회원가입"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setInfo("");
            }}
            className="mt-4 w-full text-center text-xs text-zinc-500 underline underline-offset-4 dark:text-zinc-400"
          >
            {mode === "login" ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
          </button>
        </div>
      </div>
    );
  }

  return children({ user, logout });
}
