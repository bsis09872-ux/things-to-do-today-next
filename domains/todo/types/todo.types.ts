// 할 일 상태: 준비 -> 진행 -> 완료
export type TodoStatus = 'READY' | 'PROGRESS' | 'DONE';

// 앱에서 쓰는 할 일 모양 (camelCase)
export interface Todo {
    id: string;
    userId: string;
    userName: string;
    status: TodoStatus;
    title: string;
    content: string;
    dueDate: string | null; // 마감일 'YYYY-MM-DD' (없으면 null)
    pinnedAt: string | null; // 핀 고정 시각
    sortOrder: number; // 같은 날짜 안 순서
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null; // 휴지통으로 보낸 시각 (null이면 목록에 있음)
}

// DB가 돌려주는 할 일 모양 (snake_case = DB 칸 이름 유지)
export interface TodoRow {
    id: string;
    user_id: string;
    user_name: string;
    status: TodoStatus;
    title: string;
    content: string;
    due_date: string | null;
    pinned_at: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string | null;
    deleted_at: string | null;
}

// 등록 · 수정 폼에서 받는 값
export interface TodoInput {
    title: string;
    content: string;
    dueDate: string; // 비어 있으면 '' (마감일 없음)
}
