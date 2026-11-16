import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';
import { FiTrash2 } from 'react-icons/fi';
import type { Todo, TodoStatus } from '../types/todo.types';
import TodoStatusButtons from './TodoStatusButtons';

interface TodoItemProps {
    todo: Todo;
    onStatusChange: (id: string, status: TodoStatus) => void;
    onTrash: (id: string) => void;
    onPinToggle: (id: string, pin: boolean) => void; // pin: true 면 고정, false 면 해제
}

// 할 일 카드 한 장, 데이터와 할 일을 props로 받아서 그리기만 함.
// 실제 서버에 요청하는 일은 부모 컴포넌트가 한다.
export default function TodoItem({
    todo,
    onStatusChange,
    onTrash,
    onPinToggle,
}: TodoItemProps) {
    const isDone = todo.status === 'DONE';
    const isPinned = !!todo.pinnedAt;

    return (
        <li className="rounded-2xl border p-4" data-done={isDone}>
            <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                    {todo.dueDate && (
                        <time
                            dateTime={todo.dueDate}
                            className="block text-xs text-gray-500"
                        >
                            {todo.dueDate}
                        </time>
                    )}
                    <Link
                        href={`/todo/${todo.id}`}
                        className={
                            isDone
                                ? 'font-medium text-gray-400 line-through hover:underline'
                                : 'font-medium hover:underline'
                        }
                    >
                        {todo.title}
                    </Link>
                </div>
                <div className="flex shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`${todo.title} 핀 고정`}
                        aria-pressed={isPinned}
                        onClick={() => onPinToggle(todo.id, !isPinned)}
                    >
                        {isPinned ? (
                            <BsPinAngleFill aria-hidden />
                        ) : (
                            <BsPinAngle aria-hidden />
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`${todo.title} 휴지통으로 보내기`}
                        onClick={() => onTrash(todo.id)}
                    >
                        <FiTrash2 aria-hidden />
                    </Button>
                </div>
            </div>

            <TodoStatusButtons
                status={todo.status}
                onChange={(status) => onStatusChange(todo.id, status)}
            />
        </li>
    );
}
