# My Todo — 개발 문서 (시연용)

PRD.md가 "무엇을 만들지"를 정한 문서라면, 이 문서는 **"실제로 어떻게 만들었는지"**를 설명합니다.

## 1. 사용한 언어 / 프레임워크 / 라이브러리

| 구분 | 사용 기술 | 역할 |
|---|---|---|
| 언어 | JavaScript (JSX) | UI와 로직 전부 |
| 프레임워크 | **Next.js 16** (App Router) | 페이지 라우팅, 빌드, 정적 export |
| UI 라이브러리 | **React 19** | 화면을 상태(state) 기반으로 그리는 컴포넌트 |
| 스타일링 | **Tailwind CSS v4** | 클래스 이름만으로 색상·간격·반응형 디자인 적용 |
| 로컬 DB (1단계) | **better-sqlite3** | 내 컴퓨터 파일(`todo.db`)에 저장하는 SQLite 드라이버 |
| 클라우드 DB (2단계) | **Supabase** (PostgreSQL + REST API) | 인터넷 어디서든 접속 가능한 클라우드 데이터베이스 |
| 클라우드 접속 라이브러리 | `@supabase/supabase-js` | 브라우저에서 Supabase DB에 직접 CRUD 요청을 보내는 SDK |
| 배포 | **GitHub Pages** | 정적 파일을 무료로 호스팅해 공개 URL 제공 |
| 버전 관리 | **Git / GitHub** | 코드 변경 이력 관리, 배포 소스 |

## 2. 구조: 왜 "백엔드 서버"가 따로 없는가

일반적인 웹앱은 "브라우저 → 내 서버(API) → DB" 구조지만, 이 프로젝트는 **2단계로 구조가 바뀌었습니다.**

**1단계 (로컬/Path A)**
```
브라우저  →  Next.js API 라우트 (app/api/todos/...)  →  better-sqlite3  →  todo.db 파일
```
Next.js의 `app/api/todos/route.js` 같은 파일이 "미니 백엔드 서버" 역할을 해서,
`GET/POST/PATCH/DELETE` 요청을 받아 로컬 SQLite 파일을 읽고 썼습니다.

**2단계 (클라우드/Path B, 최종 배포본)**
```
브라우저  →  (중간 서버 없이 직접)  →  Supabase REST API  →  PostgreSQL
```
Supabase는 "DB에 바로 말 걸 수 있는 API"를 기본 제공합니다. 그래서 백엔드 서버 코드를
따로 만들지 않고, 브라우저 JS 코드(`lib/supabaseClient.js`)에서 Supabase SDK로
직접 DB에 쓰고 읽습니다. 대신 **RLS(Row Level Security)**라는 DB 쪽 보안 규칙으로
"누가 무엇을 할 수 있는지"를 제어합니다.

이 구조 덕분에 서버 없이 **정적 파일만으로 GitHub Pages 배포**가 가능해졌습니다
(`next.config.mjs`의 `output: "export"`).

## 3. 데이터베이스 설계

Supabase SQL 에디터에서 실행한 테이블 생성 SQL:

```sql
create table todos (
  id bigint generated always as identity primary key,
  title text not null,
  completed boolean not null default false,
  due_date date,
  created_at timestamp with time zone default now()
);

alter table todos enable row level security;

create policy "누구나 todos 조회/추가/수정/삭제 가능"
  on todos for all
  using (true)
  with check (true);
```

- `enable row level security`를 켜면 **기본값은 "전부 차단"**입니다. 정책(policy)을
  따로 만들어야 접근이 열립니다 — 이걸로 "RLS 미설정 시 접근 불가"를 실제로 확인했습니다.
- 이 앱은 로그인이 없는 1인용이라 `using (true)`로 전체 허용 정책을 걸었습니다.
  (여러 사용자를 구분해야 하는 앱이라면 `auth.uid() = user_id` 같은 조건을 걸어야 합니다.)

## 4. 개발 순서 (실제로 진행한 단계)

1. **Next.js 프로젝트 생성** — `create-next-app`으로 App Router + Tailwind 기본 세팅
2. **Path A: 로컬 SQLite CRUD 구현**
   - `lib/db.js`: `better-sqlite3`로 DB 파일 열고 테이블 생성
   - `app/api/todos/route.js`: 목록 조회(GET), 추가(POST)
   - `app/api/todos/[id]/route.js`: 완료 토글/수정(PATCH), 삭제(DELETE)
   - `app/page.js`: `fetch("/api/todos")`로 화면과 연결
   - 서버 재시작 후에도 데이터가 남는지 직접 확인
3. **Path B: Supabase로 전환**
   - Supabase 프로젝트의 SQL 에디터에서 `todos` 테이블 + RLS 정책 생성
   - `lib/supabaseClient.js` 작성 (`createClient`로 Supabase 연결)
   - `app/page.js`의 `fetch` 호출들을 `supabase.from("todos")...` 호출로 교체
   - API 라우트(`app/api`), `lib/db.js`, `better-sqlite3` 의존성 제거
   - 브라우저를 완전히 껐다 켜도(=새 세션) 데이터가 남는지 확인
4. **기능 추가**
   - 마감일(`due_date`) 입력 필드 추가, DB 컬럼 추가
   - `components/Calendar.js`: 월 달력을 직접 계산해서 그리는 컴포넌트
     (라이브러리 없이 `Date` 객체로 날짜 칸을 계산)
   - 달력 날짜 클릭 → 그 날짜로 바로 할 일 추가하는 인라인 폼
5. **배포**
   - `next.config.mjs`에 `output: "export"`, `basePath: "/todo-app"` 설정
   - `npm run build` → 정적 파일(`out/`)을 `gh-pages` 브랜치에 푸시
   - GitHub Pages가 자동으로 `https://gsahn26.github.io/todo-app/`에 배포
6. **UI/UX 개선 (디자인 반복)**
   - 마감 배지, X 삭제 버튼, 보라색 테마로 리디자인
   - 삭제 시 페이드아웃 애니메이션 (`components/TodoCard.js`의 `deleting` 상태 + Tailwind `transition`)
   - **칼럼/보드형(Kanban) 레이아웃**으로 전환 — "예정/오늘/완료" 3칼럼
     (`app/page.js`의 `COLUMNS` 배열에 각 칼럼의 필터 조건을 정의하고,
     `todos.filter(...)`로 같은 데이터를 칼럼별로 나눠서 렌더링)

## 5. 핵심 코드 포인트 (시연 때 설명하기 좋은 부분)

**(1) 서버 없이 DB와 직접 통신 — `lib/supabaseClient.js`**
```js
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

**(2) 완료 체크 → 칼럼 자동 이동의 원리 — `app/page.js`**
```js
const COLUMNS = [
  { key: "upcoming", title: "예정", filter: (t, today) => !t.completed && t.due_date !== today },
  { key: "today",    title: "오늘", filter: (t, today) => !t.completed && t.due_date === today },
  { key: "done",     title: "완료", filter: (t) => t.completed },
];
// 렌더링 시: todos.filter(t => col.filter(t, today))
```
실제로 카드를 "이동"시키는 코드는 없고, **완료 여부(`completed`)가 바뀌면
같은 할 일 데이터가 다른 칼럼의 필터 조건에 걸려서** 자동으로 다른 칼럼에 나타납니다.
(React가 상태 변화를 감지해 전체를 다시 그리는 방식)

**(3) 삭제 애니메이션의 원리 — `deleteTodo` 함수**
```js
async function deleteTodo(id) {
  setDeletingIds(prev => new Set(prev).add(id));      // 1. 먼저 "사라지는 중" 표시만
  setTimeout(async () => {
    await supabase.from("todos").delete().eq("id", id); // 2. 0.3초 후 실제 DB 삭제
    await load();
  }, 300);
}
```
실제 삭제 전에 CSS로 먼저 흐려지고 작아지게 만든 뒤, 애니메이션이 끝나는 타이밍에
맞춰 진짜 삭제 요청을 보내는 방식입니다.

## 6. 배포 구조 요약

```
내 컴퓨터 (npm run build)
   → out/ 폴더 (정적 HTML/JS/CSS)
   → git push (gh-pages 브랜치)
   → GitHub Pages가 자동으로 공개
   → https://gsahn26.github.io/todo-app/
```
화면(프론트엔드)만 배포되고, 데이터는 Supabase 클라우드에 있기 때문에
**"정적 사이트 + 클라우드 DB"** 조합으로 서버 비용 없이 운영됩니다.

## 7. 시연 체크리스트
- [ ] 할 일 추가 (마감일 포함) → 해당 칼럼/달력에 반영되는 것 보여주기
- [ ] 완료 체크 → 카드가 "완료" 칼럼으로 이동하는 것 보여주기
- [ ] 삭제 → 페이드아웃 후 사라지는 것 보여주기
- [ ] 달력 날짜 클릭 → 바로 추가되는 것 보여주기
- [ ] 브라우저 새로고침/재접속해도 데이터 유지되는 것 보여주기 (Supabase 저장 증명)
- [ ] (선택) Supabase SQL 에디터에서 `select * from todos;` 실행해서 실제 DB에 쌓인 데이터 보여주기
