import TodoDashboard from '@/domains/todo/components/TodoDashboard';
import { getTodos } from '@/domains/todo/queries/getTodos.query';
import { Suspense } from 'react';

// 서버 컴포넌트 : DB 조회는 서버에서 함 (키 · 쿼리가 브라우저에 노출되지 않음)
// 목록을 불러오는 동안에는 fallback을 먼저 보여줌
export default function HomePage() {
    return (
        <Suspense fallback={<p className="py-16 text-center">불러오는 중…</p>}>
            <TodoList />
        </Suspense>
    );
}

// 로그인 쿠키를 읽어 DB를 조회해서 Suspense 안에서 실행해야 함 (Cache Components 규칙)
async function TodoList() {
    const todos = await getTodos();
    return <TodoDashboard todos={todos} />;
}
