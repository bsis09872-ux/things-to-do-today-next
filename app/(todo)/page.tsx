import TodoDashboard from '@/domains/todo/components/TodoDashboard';
import TodoListSkeleton from '@/domains/todo/components/TodoListSkeleton';
import { getTodos } from '@/domains/todo/queries/getTodos.query';
import { pickCheer } from '@/domains/todo/utils/todoCheer';
import { Suspense } from 'react';

// 서버 컴포넌트 : DB 조회는 서버에서 함 (키 · 쿼리가 브라우저에 노출되지 않음)
// 목록을 불러오는 동안에는 fallback을 먼저 보여줌
export default function HomePage() {
    return (
        <Suspense fallback={<TodoListSkeleton />}>
            <TodoList />
        </Suspense>
    );
}

// 로그인 쿠키를 읽어 DB를 조회해서 Suspense 안에서 실행해야 함 (Cache Components 규칙)
async function TodoList() {
    const todos = await getTodos();
    // 응원 문구는 랜덤이라 요청 때마다 골라야 함 -> 쿠키를 읽은 뒤(요청 시점)에 부름
    // (Cache Components 는 요청 데이터 없이 Math.random 을 쓰면 빌드 에러를 냄)
    return <TodoDashboard todos={todos} cheer={pickCheer()} />;
}
