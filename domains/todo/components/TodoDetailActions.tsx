'use client';

import { Button, buttonVariants } from '@/shared/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import {
    changeTodoStatusAction,
    moveTodoToTrashAction,
} from '../actions/todo.actions';
import type { TodoStatus } from '../types/todo.types';
import TodoStatusButtons from './TodoStatusButtons';

interface TodoDetailActionsProps {
    id: string;
    status: TodoStatus;
}

// 상세 화면에서 버튼이 필요한 부분만 떼어 낸 클라이언트 컴포넌트
// (제목 · 메모 같은 내용 표시는 서버 컴포넌트 TodoDetail이 맡음)
export default function TodoDetailActions({
    id,
    status,
}: TodoDetailActionsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    // 서버 응답 전에 버튼 상태를 먼저 바꿔 보여줌 (실패하면 자동으로 원래 상태로)
    const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);

    const onStatusChange = (next: TodoStatus) => {
        startTransition(async () => {
            setOptimisticStatus(next);
            const result = await changeTodoStatusAction(id, next);
            if (!result.success) {
                alert(result.message ?? '상태를 바꾸지 못했습니다.');
            }
        });
    };

    const onTrash = () => {
        if (!confirm('이 할 일을 휴지통으로 보낼까요?')) return;

        startTransition(async () => {
            const result = await moveTodoToTrashAction(id);
            if (result.success) {
                router.replace('/'); // 지운 할 일의 상세에 머물 이유가 없어서 목록으로
            } else {
                alert(result.message ?? '삭제하지 못했습니다.');
            }
        });
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <TodoStatusButtons
                status={optimisticStatus}
                onChange={onStatusChange}
                disabled={isPending}
            />
            <div className="flex gap-2">
                <Link
                    href={`/todo/${id}/edit`}
                    className={buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                    })}
                >
                    <FiEdit2 aria-hidden />
                    수정
                </Link>
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={onTrash}
                >
                    <FiTrash2 aria-hidden />
                    삭제
                </Button>
            </div>
        </div>
    );
}
