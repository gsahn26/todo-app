# My Todo

할 일을 추가 · 완료 체크 · 삭제하고, 마감일을 달력에서 한눈에 볼 수 있는 Todo 앱입니다.
Supabase(클라우드 DB)에 데이터가 저장되어 어디서 접속해도 같은 데이터를 볼 수 있습니다.

## 바로 실행해보기 (설치 불필요)

**[https://gsahn26.github.io/todo-app/](https://gsahn26.github.io/todo-app/)**

위 링크 클릭하면 바로 사용할 수 있습니다.

## 기능

- 할 일 추가 / 완료 체크 / 삭제
- 마감일 지정 ("마감 YYYY-MM-DD" 배지로 표시)
- 하단 달력에서 마감일별로 할 일 확인 (이전/다음 달 이동 가능)
- Supabase 클라우드 DB 저장 — 로컬 저장(SQLite)에서 시작해 Supabase로 전환

## 로컬에서 직접 실행하기

```bash
git clone https://github.com/gsahn26/todo-app.git
cd todo-app
npm install
```

`.env.local` 파일을 만들고 Supabase 프로젝트의 URL/anon key를 넣어주세요:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 배포 준비 노트

Render 배포 검토 내용은 [DEPLOY_NOTES.md](./DEPLOY_NOTES.md)에 정리되어 있습니다.

## 과제 후기

달력 만들기 과제, 클로드와 트러블이 있었지만 과제 완성했습니다.
