import type { Todo } from '../types/todo.types';

// 목록 보기 설정 (필터 · 정렬 · 핀 개수 제한)
// 값은 주소(?filter=done&sort=due)에 담아서, 새로고침 · 링크 공유해도 그대로 유지됨

export type TodoFilter = 'all' | 'active' | 'done';
export type TodoSort = 'created' | 'due';

export const PIN_MAX = 3; // 핀은 최대 3개

// 필터 : 이름, 조건, 비었을 때 문구를 한 곳에 모아 둠 (새 필터는 여기만 추가하면 됨)
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

// 정렬 : 이름과 비교 함수
export const TODO_SORTS: Record<
    TodoSort,
    { label: string; compare: (a: Todo, b: Todo) => number }
> = {
    // 최신 등록이 위로
    created: {
        label: '등록순',
        compare: (a, b) => b.createdAt.localeCompare(a.createdAt),
    },
    // 마감일이 빠른 순, 마감일이 없으면 맨 아래 (같으면 최신 등록이 위로)
    due: {
        label: '마감일순',
        compare: (a, b) => {
            if (a.dueDate === b.dueDate) {
                return b.createdAt.localeCompare(a.createdAt);
            }
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate.localeCompare(b.dueDate);
        },
    },
};

// 주소창 값은 누구나 바꿀 수 있어서, 모르는 값이면 기본값으로
export function parseFilter(value: string | null): TodoFilter {
    return value === 'active' || value === 'done' ? value : 'all';
}

export function parseSort(value: string | null): TodoSort {
    return value === 'due' ? 'due' : 'created';
}
