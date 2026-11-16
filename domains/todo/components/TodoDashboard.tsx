'use client';

import FormMessage from '@/domains/auth/components/FormMessage';
import { buttonVariants } from '@/shared/components/ui/button';
import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';
import { FiPlus } from 'react-icons/fi';
import {
    changeTodoStatusAction,
    moveTodoToTrashAction,
} from '../actions/todo.actions';
import type { Todo, TodoStatus } from '../types/todo.types';
import { TODO_STATUS_LABEL } from '../utils/todoStatus';
import TodoEmpty from './TodoEmpty';
import TodoItem from './TodoItem';

interface TodoDashboardProps {
    todos: Todo[]; // 서버(page)에서 불러온 목록
    cheer: string; // 빈 목록일 때 보여줄 응원 문구 (서버에서 고름)
}

// 화면 위에 잠깐 띄우는 결과 안내
type Notice = { message: string; success: boolean };

// 화면에 먼저 반영할 변경 종류
type OptimisticAction =
    | { type: 'status'; id: string; status: TodoStatus }
    | { type: 'remove'; id: string };

function applyOptimistic(todos: Todo[], action: OptimisticAction): Todo[] {
    switch (action.type) {
        case 'status':
            return todos.map((todo) =>
                todo.id === action.id
                    ? { ...todo, status: action.status }
                    : todo,
            );
        case 'remove':
            return todos.filter((todo) => todo.id !== action.id);
    }
}

// 'use client' : 클릭, 낙관적 업데이트, 진행 상태는 브라우저에서만 됨.
// 데이터는 서버 컴포넌트(page)가 불러와서 props로 넘겨줌 -> 서버/클라이언트 역할 분리
export default function TodoDashboard({ todos, cheer }: TodoDashboardProps) {
    const [isPending, startTransition] = useTransition();
    const [notice, setNotice] = useState<Notice | null>(null);

    // 성공 안내는 2초 뒤 사라짐, 실패 안내는 다음 동작 전까지 남김
    // (2초 사이에 새 안내가 떴으면 그건 지우지 않음)
    const showNotice = (next: Notice) => {
        setNotice(next);
        if (next.success) {
            setTimeout(
                () => setNotice((cur) => (cur === next ? null : cur)),
                2000,
            );
        }
    };

    // useState(todos)로 복사하면 처음 값만 기억해서, 서버가 새 목록을 보내도 화면이 안 바뀜.
    // -> props를 그대로 쓰고, 서버 응답 전까지만 useOptimistic으로 바뀐 모습을 미리 보여줌.
    //    실패하면 원래 todos로 자동으로 돌아감.
    const [optimisticTodos, addOptimistic] = useOptimistic(
        todos,
        applyOptimistic,
    );

    const onStatusChange = (id: string, status: TodoStatus) => {
        startTransition(async () => {
            addOptimistic({ type: 'status', id, status }); // 화면 먼저
            const result = await changeTodoStatusAction(id, status); // 서버는 나중에
            // alert 대신 화면 안에 결과를 보여줌 (흐름을 끊지 않음)
            showNotice(
                result.success
                    ? {
                          success: true,
                          message:
                              status === 'DONE'
                                  ? '🎉 완료했어요. 잘했어요!'
                                  : `${TODO_STATUS_LABEL[status]} 상태로 바꿨어요.`,
                      }
                    : {
                          success: false,
                          message:
                              result.message ?? '상태를 바꾸지 못했습니다.',
                      },
            );
        });
    };

    const onTrash = (id: string) => {
        if (!confirm('이 할 일을 휴지통으로 보낼까요?')) return;

        startTransition(async () => {
            addOptimistic({ type: 'remove', id });
            const result = await moveTodoToTrashAction(id);
            showNotice(
                result.success
                    ? { success: true, message: '휴지통으로 보냈어요.' }
                    : {
                          success: false,
                          message: result.message ?? '삭제하지 못했습니다.',
                      },
            );
        });
    };

    const remaining = optimisticTodos.filter(
        (todo) => todo.status !== 'DONE',
    ).length;

    return (
        <section aria-labelledby="list-title">
            <div className="mb-4 flex items-end justify-between border-b pb-3">
                <div>
                    <h1 id="list-title" className="text-2xl font-bold">
                        my list
                    </h1>
                    <p className="text-sm text-gray-500" aria-live="polite">
                        남은 할 일 <strong>{remaining}</strong>개
                        {isPending && ' · 저장 중…'}
                    </p>
                </div>
                {/* 페이지 이동이라 <a>(Link)를 쓰고, 버튼 모양만 빌려 옴 (buttonVariants) */}
                <Link href="/todo/new" className={buttonVariants()}>
                    <FiPlus aria-hidden />새 할 일
                </Link>
            </div>

            <FormMessage message={notice?.message} success={notice?.success} />

            {optimisticTodos.length === 0 ? (
                <TodoEmpty cheer={cheer} />
            ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                    {optimisticTodos.map((todo) => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onStatusChange={onStatusChange}
                            onTrash={onTrash}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}
