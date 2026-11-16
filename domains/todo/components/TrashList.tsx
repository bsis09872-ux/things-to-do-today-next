'use client';

import FormMessage from '@/domains/auth/components/FormMessage';
import { Button } from '@/shared/components/ui/button';
import { useOptimistic, useState, useTransition } from 'react';
import { FiRotateCcw, FiX } from 'react-icons/fi';
import {
    deleteTodoForeverAction,
    restoreTodoAction,
} from '../actions/todo.actions';
import type { Todo } from '../types/todo.types';
import { formatDateTime } from '../utils/todoDate';

interface TrashListProps {
    todos: Todo[]; // 휴지통에 있는 할 일
}

// 'use client' : 복구 · 영구 삭제 버튼 클릭과 낙관적 업데이트
export default function TrashList({ todos }: TrashListProps) {
    const [isPending, startTransition] = useTransition();
    const [errorMessage, setErrorMessage] = useState('');
    // 복구든 영구 삭제든 휴지통에서는 사라지므로, 지우는 동작 하나만 있으면 됨
    const [optimisticTodos, removeOptimistic] = useOptimistic(
        todos,
        (current: Todo[], id: string) =>
            current.filter((todo) => todo.id !== id),
    );

    const run = (id: string, action: typeof restoreTodoAction) => {
        setErrorMessage('');
        startTransition(async () => {
            removeOptimistic(id);
            const result = await action(id);
            if (!result.success) {
                setErrorMessage(result.message ?? '처리하지 못했습니다.');
            }
        });
    };

    const onDeleteForever = (id: string) => {
        // 되돌릴 수 없는 동작이라 한 번 더 확인
        if (!confirm('영구 삭제하면 되돌릴 수 없어요. 삭제할까요?')) return;
        run(id, deleteTodoForeverAction);
    };

    return (
        <section aria-labelledby="trash-title">
            <div className="mb-4 border-b pb-3">
                <h1 id="trash-title" className="text-2xl font-bold">
                    휴지통
                </h1>
                <p className="text-sm text-gray-500" aria-live="polite">
                    {optimisticTodos.length}개{isPending && ' · 저장 중…'}
                </p>
            </div>

            <FormMessage message={errorMessage} />

            {optimisticTodos.length === 0 ? (
                <p className="rounded-2xl border border-dashed py-16 text-center text-gray-500">
                    휴지통이 비어 있습니다.
                </p>
            ) : (
                <ul className="space-y-2">
                    {optimisticTodos.map((todo) => (
                        <li
                            key={todo.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border p-4"
                        >
                            <div className="min-w-0">
                                <p className="truncate font-medium">
                                    {todo.title}
                                </p>
                                {todo.deletedAt && (
                                    <p className="text-xs text-gray-500">
                                        버린 시각{' '}
                                        {formatDateTime(todo.deletedAt)}
                                    </p>
                                )}
                            </div>
                            <div className="flex shrink-0 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        run(todo.id, restoreTodoAction)
                                    }
                                >
                                    <FiRotateCcw aria-hidden />
                                    복구
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onDeleteForever(todo.id)}
                                >
                                    <FiX aria-hidden />
                                    영구 삭제
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
