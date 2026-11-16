import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import { createServerClient } from '@/shared/lib/supabase';
import type { Todo, TodoRow } from '../types/todo.types';
import { toTodo } from '../utils/todoConverter';
import { isUuid } from '../utils/todoValidation';

// 할 일 하나 (상세 · 수정 화면). 없거나 내 것이 아니면 null → 화면에서 404 처리
export async function getTodoById(id: string): Promise<Todo | null> {
    // 주소창에 /todo/abc 처럼 id 형식이 아닌 값이 오면 DB 에 묻지 않고 바로 null
    // (그대로 보내면 DB 가 형식 에러를 내서 404 가 아니라 에러 화면이 뜬다)
    if (!isUuid(id)) return null;

    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .maybeSingle(); // 결과가 없으면 에러 대신 null

    if (error) {
        console.error(`할 일 조회 실패 [id: ${id}]:`, error.message);
        throw new Error('할 일을 불러오지 못했습니다.');
    }

    return data ? toTodo(data as TodoRow) : null;
}
