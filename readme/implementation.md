# 🛠️ 구현 상세

[← README로 돌아가기](../README.md)

## 1. 폴더 구조

페이지 주소는 `app/`이, 기능 코드는 `domains/`가, 여러 기능이 같이 쓰는 부품은 `shared/`가 맡습니다.

```
app/                         라우팅 (주소 = 폴더)
├─ (auth)/                   로그인 전 화면 (라우트 그룹 : 주소에는 안 나옴)
│  ├─ sign_in/page.tsx       /sign_in
│  └─ sign_up/page.tsx       /sign_up
├─ (todo)/                   로그인 후 화면 (공통 헤더 layout)
│  ├─ page.tsx               /
│  ├─ error.tsx              에러 화면 (다시 시도)
│  ├─ trash/page.tsx         /trash
│  └─ todo/
│     ├─ new/page.tsx        /todo/new
│     └─ [id]/               동적 라우트
│        ├─ page.tsx         /todo/:id
│        ├─ edit/page.tsx    /todo/:id/edit
│        └─ not-found.tsx    할 일 404
├─ not-found.tsx             전체 404
└─ globals.css               디자인 토큰
domains/
├─ auth/                     회원
│  ├─ actions/               로그인 · 회원가입 · 로그아웃 (서버 액션)
│  ├─ components/            폼 · 사용자 메뉴
│  ├─ queries/               지금 로그인한 사람 조회
│  ├─ types/ · utils/        타입 · 입력값 검사 · 안전한 이동 주소
└─ todo/                     할 일
   ├─ actions/               등록 · 수정 · 상태 · 핀 · 휴지통 (서버 액션)
   ├─ components/            목록 · 카드 · 폼 · 상세 · 휴지통 · 스켈레톤
   ├─ queries/               목록 · 하나 · 휴지통 조회
   ├─ types/                 Todo(앱) · TodoRow(DB) 타입
   └─ utils/                 변환 · 검사 · 날짜 · 필터/정렬 · 응원 문구
shared/
├─ components/               Brand(로고), ui/(shadcn 버튼 · 입력칸)
├─ lib/                      Supabase 클라이언트, proxy 세션 처리
└─ types/                    ActionState<T> (모든 액션의 결과 모양)
proxy.ts                     모든 요청 앞에서 로그인 확인
supabase/schema.sql          테이블 · RLS · 트리거
```

**한 기능은 한 폴더에** 모아서, 할 일 기능을 고칠 때는 `domains/todo`만 보면 되도록 했습니다.

<br />

## 2. 서버 · 클라이언트 컴포넌트 나누기

기본은 **서버 컴포넌트**이고, 클릭 · 입력처럼 브라우저에서만 되는 일이 있을 때만 `'use client'`를 붙였습니다. 파일마다 맨 위 주석에 이유를 적었습니다.

| 컴포넌트                         | 종류            | 이유                                                |
| -------------------------------- | --------------- | --------------------------------------------------- |
| `app/(todo)/page.tsx`            | 서버            | DB 조회는 서버에서 (키 · 쿼리가 브라우저에 안 보임) |
| `TodoDashboard`                  | 클라이언트      | 클릭, 낙관적 업데이트, 필터 · 정렬 주소 바꾸기      |
| `TodoItem` · `TodoStatusButtons` | (부모를 따라감) | props로 받은 걸 그리기만 함                         |
| `TodoForm`                       | 클라이언트      | 입력값 상태, 제출 상태(`useActionState`)            |
| `TodoDetail`                     | 서버            | 내용만 보여 줌 → 이 코드는 브라우저로 안 내려감     |
| `TodoDetailActions`              | 클라이언트      | 상세 화면의 버튼 부분만 떼어 냄                     |
| `UserMenu`                       | 서버            | 쿠키로 로그인한 사람 확인                           |
| `SignOutButton`                  | 클라이언트      | 버튼 하나만 클라이언트로                            |

**데이터 흐름**

```
page(서버) ── getTodos() ──▶ TodoDashboard(클라이언트) ── props ──▶ TodoItem
                                   │ 클릭
                                   ▼
                        useOptimistic 으로 화면 먼저 변경
                                   │
                                   ▼
                     서버 액션 (로그인 확인 → 검사 → DB 변경)
                                   │ revalidatePath('/')
                                   ▼
                     page 가 새 목록을 다시 내려줌 → 화면이 서버 값으로 맞춰짐
```

<br />

## 3. 낙관적 업데이트 (`useOptimistic`)

서버 응답을 기다리지 않고 화면을 먼저 바꿉니다. 받은 props(`todos`)를 그대로 기준으로 쓰기 때문에, 서버가 새 목록을 보내면 자동으로 그 값으로 맞춰지고, 실패하면 원래 값으로 돌아갑니다.

```tsx
const [optimisticTodos, addOptimistic] = useOptimistic(todos, applyOptimistic);

const onStatusChange = (id: string, status: TodoStatus) => {
    startTransition(async () => {
        addOptimistic({ type: 'status', id, status });           // 화면 먼저
        const result = await changeTodoStatusAction(id, status); // 서버는 나중에
        showNotice(result.success ? { ... } : { ... });          // 결과 안내
    });
};
```

`useState(todos)`로 복사하면 처음 값만 기억해서 서버가 새 목록을 보내도 화면이 안 바뀝니다. 그래서 복사하지 않았습니다.

<br />

## 4. 필터 · 정렬은 주소에 저장

1차 과제에서는 localStorage에 저장했던 필터 · 정렬을 **주소(`?filter=done&sort=due`)**에 담았습니다. 새로고침 · 뒤로 가기 · 링크 공유를 해도 보던 화면이 그대로입니다.

조건은 1차 과제처럼 **함수를 담은 객체**로 관리해서, 새 필터는 객체에 항목만 추가하면 됩니다.

```ts
export const TODO_FILTERS: Record<
    TodoFilter,
    { label: string; test: (todo: Todo) => boolean; empty: string }
> = {
    all: { label: '전체', test: () => true, empty: '등록된 할 일이 없어요' },
    active: {
        label: '진행중',
        test: (todo) => todo.status !== 'DONE',
        empty: '진행 중인 할 일이 없어요',
    },
    done: {
        label: '완료',
        test: (todo) => todo.status === 'DONE',
        empty: '아직 완료한 할 일이 없어요',
    },
};

const visibleTodos = optimisticTodos
    .filter(TODO_FILTERS[filter].test)
    .sort(TODO_SORTS[sort].compare);
```

<br />

## 5. 보안

| 항목             | 방법                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| 접근 제어        | `proxy.ts` **허용 목록** : 로그인 없이 열리는 페이지(`/sign_in`, `/sign_up`)만 적고 나머지는 전부 잠금      |
| 오픈 리다이렉트  | `?redirectUrl=`은 `new URL()`로 해석해 같은 사이트일 때만 이동                                              |
| 서버 액션        | 누구나 호출할 수 있는 공개 주소라서, 액션마다 로그인 확인 + 입력값 검사(`isUuid`, `isTodoStatus`)를 다시 함 |
| DB               | RLS로 본인 데이터만 읽고 쓰기 + 코드에서도 `.eq('user_id', user.id)`로 한 번 더                             |
| 로그인 확인      | 쿠키를 그대로 믿는 `getSession()` 대신 서버에 검증받는 `getUser()`                                          |
| 로그인 에러 문구 | 이메일이 없는지 · 비밀번호가 틀렸는지 구분하지 않음 (가입 여부 노출 방지)                                   |
| 키               | publishable 키만 사용, `.env.local`은 git에 올리지 않음                                                     |

```ts
// proxy.ts → shared/lib/supabaseProxy.ts
const AUTH_PAGES = ['/sign_in', '/sign_up'];

function isAuthPath(pathname: string): boolean {
    return AUTH_PAGES.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
}
```

<br />

## 6. 상태별 화면

| 상태      | 화면                                                      | 파일                                                         |
| --------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| 로딩      | 실제 목록 · 상세와 같은 모양의 스켈레톤                   | `TodoListSkeleton`, `TodoDetailSkeleton` (Suspense fallback) |
| 성공      | "🎉 완료했어요. 잘했어요!" 같은 결과 안내 (2초 뒤 사라짐) | `TodoDashboard` + `FormMessage`                              |
| 오류      | 폼 칸별 에러 · 화면 위 안내 · 에러 화면(다시 시도)        | `FieldError`, `FormMessage`, `app/(todo)/error.tsx`          |
| 빈 데이터 | 응원 문구 + "첫 할 일 등록하기"                           | `TodoEmpty`                                                  |
| 없음      | 할 일 404 · 전체 404                                      | `todo/[id]/not-found.tsx`, `app/not-found.tsx`               |
