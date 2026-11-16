import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import { createServerClient } from '@/shared/lib/supabase';
import type { Todo, TodoRow } from '../types/todo.types';
import { toTodo } from '../utils/todoConverter';

// 휴지통 목록 (deleted_at 에 값이 있는 것, 최근에 버린 순)
export async function getTrashedTodos(): Promise<Todo[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

    if (error) {
        console.error('휴지통 조회 실패:', error.message);
        throw new Error('휴지통을 불러오지 못했습니다.');
    }

    return (data as TodoRow[]).map(toTodo);
}
