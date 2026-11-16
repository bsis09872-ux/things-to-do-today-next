import type { TodoInput } from '../types/todo.types';

export const TITLE_MAX = 100;
export const CONTENT_MAX = 2000;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
// Supabase 의 id 형식(uuid). 주소창에 /todo/abc 처럼 엉뚱한 값을 넣으면 DB 에 묻기 전에 걸러낸다.
const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
    return UUID_REGEX.test(value);
}
export function validateTodoInput(input: TodoInput): Record<string, string> {
    const errors: Record<string, string> = {};

    // 제목 : 필수
    if (!input.title.trim()) {
        errors.title = '할 일 제목을 입력해 주세요.';
    } else if (input.title.trim().length > TITLE_MAX) {
        errors.title = `제목은 ${TITLE_MAX}자 이하로 입력해 주세요.`;
    }

    // 마감일 : 선택 (넣었다면 날짜 형식인지 확인)
    if (input.dueDate && !DATE_REGEX.test(input.dueDate)) {
        errors.dueDate = '올바른 날짜를 선택해 주세요.';
    }

    // 메모 : 선택 (길이만 제한)
    if (input.content.length > CONTENT_MAX) {
        errors.content = `메모는 ${CONTENT_MAX}자 이하로 입력해 주세요.`;
    }

    return errors;
}
