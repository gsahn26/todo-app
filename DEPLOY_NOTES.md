# 배포 준비 노트 (과제 기록용)

## 이번에 실제로 한 배포 방식
이 Todo 앱은 서버(백엔드)가 따로 없습니다. 브라우저에서 바로 Supabase(클라우드 DB)에
접속해서 데이터를 읽고 쓰기 때문에, Next.js를 "정적 사이트(static export)"로 빌드해서
GitHub Pages에 올렸습니다. (https://gsahn26.github.io/todo-app/)

- Build Command: `npm run build` (next.config.mjs에 `output: "export"` 설정)
- 결과물: `out/` 폴더 → GitHub `gh-pages` 브랜치에 그대로 올림
- 환경변수(.env.local)는 로컬에만 있고, 빌드 시점에 코드에 포함(inline)됨
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- 이 값들은 "공개 가능한" anon key라서 클라이언트 코드에 들어가도 안전함
  (DB 접근 권한은 Supabase의 RLS 정책으로 제한)

## Render가 필요한 경우 (참고용 — 이번엔 안 씀)
지금처럼 "백엔드 없이 브라우저가 직접 DB에 접속하는 구조"에서는 Render가 필요 없습니다.
하지만 만약 나중에 Next.js API 라우트(서버 코드)를 쓰는 구조로 바꾸면(= `output: "export"`를
빼고 일반 Next.js 서버로 운영), Render 같은 백엔드 호스팅이 필요해집니다.
그때 Render에서 설정해야 할 것들:

| 항목 | 값 |
|---|---|
| 서비스 타입 | Web Service |
| 연결 대상 | GitHub 저장소 (todo-app) |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Node 버전 | 18 이상 (package.json의 engines 또는 Render 설정에서 지정) |
| 환경변수 | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Render 대시보드 Environment 탭에 등록) |
| 인스턴스 타입 | Free (단, 일정 시간 요청 없으면 슬립 → 첫 요청 느림) |
| Auto-Deploy | GitHub main 브랜치에 push할 때마다 자동 재배포 |

## 결론
- 지금 Todo 앱: **Render 불필요**, GitHub Pages로 충분
- 서버 로직(API 라우트, 인증 미들웨어 등)이 생기면 그때 Render 같은 서버 호스팅으로 이전
