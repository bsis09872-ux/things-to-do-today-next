import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import { createServerClient } from '@/shared/lib/supabase';
import type { Todo, TodoRow } from '../types/todo.types';
import { toTodo } from '../utils/todoConverter';

// 조회 함수에는 'use server' 를 붙이지 않는다.
// 'use server' 를 붙이면 브라우저에서 호출할 수 있는 공개 API 가 된다.
// 조회는 서버 컴포넌트(page)에서만 부르면 되므로, 굳이 바깥에 열어 둘 이유가 없다.

// 로그인한 사람의 할 일 목록 (휴지통 제외, 최신순)
export async function getTodos(): Promise<Todo[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id) // RLS 가 이미 막지만, 코드에서도 한 번 더 (이중 잠금)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    // 에러가 나면 빈 배열([])을 돌려주던 것을 에러로 던지게 바꿨다.
    // 빈 배열을 돌려주면 "DB 연결 실패"가 "할 일이 없어요" 화면으로 보여서 문제를 숨긴다.
    if (error) {
        console.error('할 일 목록 조회 실패:', error.message);
        throw new Error('할 일 목록을 불러오지 못했습니다.');
    }

    return (data as TodoRow[]).map(toTodo);
}
