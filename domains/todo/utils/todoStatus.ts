import type { TodoStatus } from '../types/todo.types';

// 상태 -> 화면에 보일 이름
export const TODO_STATUS_LABEL: Record<TodoStatus, string> = {
    READY: '준비',
    PROGRESS: '진행중',
    DONE: '완료',
};

// 화면에 버튼을 그릴 순서
export const TODO_STATUSES: TodoStatus[] = ['READY', 'PROGRESS', 'DONE'];

// 바깥에서 들어온 값이 진짜 상태 값인지 검사 (서버 액션은 아무 값이나 받을 수 있어서)
export function isTodoStatus(value: unknown): value is TodoStatus {
    return TODO_STATUSES.includes(value as TodoStatus);
}
