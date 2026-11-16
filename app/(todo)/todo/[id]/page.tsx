import TodoDetail from '@/domains/todo/components/TodoDetail';
import { getTodoById } from '@/domains/todo/queries/getTodoById.query';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export const metadata = { title: '할 일 상세' };

// 동적 라우트 : 폴더 이름 [id] 자리에 오는 값이 params.id로 들어옴 (예: /todo/abc -> id = 'abc')
// Next 16에서 params는 Promise이고, 요청할 때 정해지는 값이라 Suspense 안에서 꺼내야 함.
// (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md)
export default function TodoDetailPage({ params }: PageProps<'/todo/[id]'>) {
    return (
        <section className="mx-auto max-w-xl space-y-4">
            <Link href="/" className="text-sm text-gray-500 hover:underline">
                ← 목록으로
            </Link>
            <Suspense
                fallback={<p className="py-16 text-center">불러오는 중…</p>}
            >
                {params.then(({ id }) => (
                    <TodoDetailContent id={id} />
                ))}
            </Suspense>
        </section>
    );
}

async function TodoDetailContent({ id }: { id: string }) {
    const todo = await getTodoById(id);
    // 없는 id · 남의 할 일 · 휴지통에 있는 할 일 -> 404
    if (!todo) notFound();

    return <TodoDetail todo={todo} />;
}
