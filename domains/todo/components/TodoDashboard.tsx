'use client';

import FormMessage from '@/domains/auth/components/FormMessage';
import { buttonVariants } from '@/shared/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useOptimistic, useState, useTransition } from 'react';
import { FiPlus } from 'react-icons/fi';
import {
    changeTodoStatusAction,
    moveTodoToTrashAction,
    toggleTodoPinAction,
} from '../actions/todo.actions';
import type { Todo, TodoStatus } from '../types/todo.types';
import { TODO_STATUS_LABEL } from '../utils/todoStatus';
import type { TodoFilter, TodoSort } from '../utils/todoView';
import {
    parseFilter,
    parseSort,
    PIN_MAX,
    TODO_FILTERS,
    TODO_SORTS,
} from '../utils/todoView';
import TodoEmpty from './TodoEmpty';
import TodoItem from './TodoItem';
import TodoPinBoard from './TodoPinBoard';
import TodoToolbar from './TodoToolbar';

interface TodoDashboardProps {
    todos: Todo[]; // 서버(page)에서 불러온 목록
    cheer: string; // 빈 목록일 때 보여줄 응원 문구 (서버에서 고름)
}

// 화면 위에 잠깐 띄우는 결과 안내
type Notice = { message: string; success: boolean };

// 화면에 먼저 반영할 변경 종류
type OptimisticAction =
    | { type: 'status'; id: string; status: TodoStatus }
    | { type: 'remove'; id: string }
    | { type: 'pin'; id: string; pinnedAt: string | null };

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
        case 'pin':
            return todos.map((todo) =>
                todo.id === action.id
                    ? { ...todo, pinnedAt: action.pinnedAt }
                    : todo,
            );
    }
}

// 'use client' : 클릭, 낙관적 업데이트, 진행 상태는 브라우저에서만 됨.
// 데이터는 서버 컴포넌트(page)가 불러와서 props로 넘겨줌 -> 서버/클라이언트 역할 분리
export default function TodoDashboard({ todos, cheer }: TodoDashboardProps) {
    const [isPending, startTransition] = useTransition();
    const [notice, setNotice] = useState<Notice | null>(null);

    // 필터 · 정렬은 주소(?filter=done&sort=due)에서 읽음
    // -> 새로고침 · 뒤로 가기 · 링크 공유해도 보던 화면 그대로 (1차 과제의 localStorage 역할)
    const searchParams = useSearchParams();
    const filter = parseFilter(searchParams.get('filter'));
    const sort = parseSort(searchParams.get('sort'));

    // 주소만 바꾸고 서버에 다시 요청하지 않음 (목록은 이미 다 갖고 있어서)
    // Next 는 history.replaceState 를 감지해서 useSearchParams 도 같이 바꿔줌
    const updateQuery = (key: 'filter' | 'sort', value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        window.history.replaceState(null, '', `?${params.toString()}`);
    };

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

    // 핀 고정 / 해제 (화면에서 3개 제한을 먼저 막고, 서버에서도 다시 막음)
    const onPinToggle = (id: string, pin: boolean) => {
        if (pin && pins.length >= PIN_MAX) {
            showNotice({
                success: false,
                message: `핀은 최대 ${PIN_MAX}개까지 고정할 수 있어요.`,
            });
            return;
        }

        startTransition(async () => {
            addOptimistic({
                type: 'pin',
                id,
                pinnedAt: pin ? new Date().toISOString() : null,
            });
            const result = await toggleTodoPinAction(id, pin);
            showNotice(
                result.success
                    ? {
                          success: true,
                          message: pin ? '핀을 고정했어요.' : '핀을 풀었어요.',
                      }
                    : {
                          success: false,
                          message: result.message ?? '핀을 바꾸지 못했습니다.',
                      },
            );
        });
    };

    // 화면에 보여줄 값들은 state 로 따로 두지 않고, 매번 목록에서 계산함
    // (따로 두면 목록이 바뀔 때 같이 맞춰 줘야 해서 어긋나기 쉬움)
    const counts: Record<TodoFilter, number> = {
        all: optimisticTodos.length,
        active: optimisticTodos.filter(TODO_FILTERS.active.test).length,
        done: optimisticTodos.filter(TODO_FILTERS.done.test).length,
    };
    const remaining = counts.active;

    // 고정한 순서대로 (먼저 고정한 게 위로)
    const pins = optimisticTodos
        .filter((todo) => todo.pinnedAt)
        .sort((a, b) => (a.pinnedAt ?? '').localeCompare(b.pinnedAt ?? ''));

    // 필터 -> 정렬 (sort 는 원본을 바꾸므로 filter 로 만든 새 배열에만 씀)
    const visibleTodos = optimisticTodos
        .filter(TODO_FILTERS[filter].test)
        .sort(TODO_SORTS[sort].compare);

    return (
        <section aria-labelledby="list-title">
            <div className="mb-4 flex items-end justify-between border-b pb-3">
                <div>
                    <h1 id="list-title" className="font-serif text-3xl italic">
                        my list
                    </h1>
                    <p
                        className="text-sm text-muted-foreground"
                        aria-live="polite"
                    >
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
                <>
                    <TodoPinBoard pins={pins} />
                    <TodoToolbar
                        filter={filter}
                        sort={sort}
                        counts={counts}
                        onFilterChange={(next: TodoFilter) =>
                            updateQuery('filter', next)
                        }
                        onSortChange={(next: TodoSort) =>
                            updateQuery('sort', next)
                        }
                    />
                    {visibleTodos.length === 0 ? (
                        <div className="space-y-1 rounded-2xl border border-dashed py-12 text-center">
                            <p className="font-medium">
                                {TODO_FILTERS[filter].empty}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {cheer}
                            </p>
                        </div>
                    ) : (
                        <ul className="grid gap-3 sm:grid-cols-2">
                            {visibleTodos.map((todo) => (
                                <TodoItem
                                    key={todo.id}
                                    todo={todo}
                                    onStatusChange={onStatusChange}
                                    onTrash={onTrash}
                                    onPinToggle={onPinToggle}
                                />
                            ))}
                        </ul>
                    )}
                </>
            )}
        </section>
    );
}
