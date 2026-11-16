import type { Todo } from '../types/todo.types';
import { formatDateTime } from '../utils/todoDate';
import TodoDetailActions from './TodoDetailActions';

interface TodoDetailProps {
    todo: Todo;
}

// 서버 컴포넌트 ('use client' 없음) : 내용을 보여주기만 해서 서버에서 HTML로 만듦.
// -> 이 코드는 브라우저로 안 내려감. 버튼 부분만 TodoDetailActions(클라이언트)로 분리.
export default function TodoDetail({ todo }: TodoDetailProps) {
    const isDone = todo.status === 'DONE';

    return (
        <article className="space-y-6 rounded-2xl border bg-card p-6">
            <header className="space-y-1">
                {todo.dueDate && (
                    <p className="font-mono text-sm text-muted-foreground">
                        마감일{' '}
                        <time dateTime={todo.dueDate}>{todo.dueDate}</time>
                    </p>
                )}
                <h1
                    className={
                        isDone
                            ? 'text-2xl font-bold text-muted-foreground line-through decoration-tomato decoration-[3px]'
                            : 'text-2xl font-bold'
                    }
                >
                    {todo.title}
                </h1>
            </header>

            {/* whitespace-pre-wrap : 메모에 입력한 줄바꿈을 그대로 보여줌 */}
            {todo.content ? (
                <p className="whitespace-pre-wrap">{todo.content}</p>
            ) : (
                <p className="text-muted-foreground">메모가 없습니다.</p>
            )}

            <TodoDetailActions id={todo.id} status={todo.status} />

            <footer className="border-t pt-4 font-mono text-xs text-muted-foreground">
                <p>등록 {formatDateTime(todo.createdAt)}</p>
                {todo.updatedAt && <p>수정 {formatDateTime(todo.updatedAt)}</p>}
            </footer>
        </article>
    );
}
