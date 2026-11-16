import TodoForm from '@/domains/todo/components/TodoForm';
import { getTodoById } from '@/domains/todo/queries/getTodoById.query';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export const metadata = { title: '할 일 수정' };

export default function EditTodoPage({ params }: PageProps<'/todo/[id]/edit'>) {
    return (
        <section className="mx-auto max-w-xl">
            <h1 className="mb-6 text-2xl font-bold">할 일 수정</h1>
            <Suspense
                fallback={<p className="py-16 text-center">불러오는 중…</p>}
            >
                {params.then(({ id }) => (
                    <EditTodoContent id={id} />
                ))}
            </Suspense>
        </section>
    );
}

async function EditTodoContent({ id }: { id: string }) {
    const todo = await getTodoById(id);
    if (!todo) notFound();

    // 기존 값을 채운 수정 폼 (같은 TodoForm을 props만 바꿔 재사용)
    return <TodoForm todo={todo} />;
}
