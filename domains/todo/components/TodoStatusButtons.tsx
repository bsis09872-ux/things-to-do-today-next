import { Button } from '@/shared/components/ui/button';
import type { TodoStatus } from '../types/todo.types';
import { TODO_STATUS_LABEL, TODO_STATUSES } from '../utils/todoStatus';

interface TodoStatusButtonsProps {
    status: TodoStatus; // 지금 상태 (눌린 버튼으로 표시)
    onChange: (status: TodoStatus) => void; // 다른 상태 버튼을 눌렀을 때
    disabled?: boolean;
}

// 준비 · 진행중 · 완료 버튼 묶음 (목록 카드와 상세 화면에서 같이 쓴다)
// 'use client' 가 없지만, 클라이언트 컴포넌트(TodoItem 등) 안에서 쓰이면 자동으로 클라이언트에서 돈다.
export default function TodoStatusButtons({
    status,
    onChange,
    disabled = false,
}: TodoStatusButtonsProps) {
    return (
        <div className="flex gap-1.5" role="group" aria-label="상태 변경">
            {TODO_STATUSES.map((s) => {
                const isCurrent = s === status;
                return (
                    <Button
                        key={s}
                        type="button"
                        size="sm"
                        variant={isCurrent ? 'default' : 'outline'}
                        aria-pressed={isCurrent}
                        disabled={disabled || isCurrent}
                        onClick={() => onChange(s)}
                    >
                        {TODO_STATUS_LABEL[s]}
                    </Button>
                );
            })}
        </div>
    );
}
