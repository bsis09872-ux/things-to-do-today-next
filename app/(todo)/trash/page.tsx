import TodoListSkeleton from '@/domains/todo/components/TodoListSkeleton';
import TrashList from '@/domains/todo/components/TrashList';
import { getTrashedTodos } from '@/domains/todo/queries/getTrashedTodos.query';
import { Suspense } from 'react';

export const metadata = { title: '휴지통' };

// /trash : proxy 허용 목록에 없어서 따로 막지 않아도 로그인한 사람만 들어옴 (deny by default)
export default function TrashPage() {
    return (
        <Suspense fallback={<TodoListSkeleton />}>
            <TrashContent />
        </Suspense>
    );
}

async function TrashContent() {
    const todos = await getTrashedTodos();
    return <TrashList todos={todos} />;
}
