import Link from 'next/link';
import { BsPinAngleFill } from 'react-icons/bs';
import type { Todo } from '../types/todo.types';
import { PIN_MAX } from '../utils/todoView';

interface TodoPinBoardProps {
    pins: Todo[]; // 고정한 할 일 (고정한 순서대로)
}

// 핀 보드 : 중요한 할 일을 목록 위에 따로 모아 보여줌
// sticky : 스크롤해도 화면 위에 붙어서 따라다님
export default function TodoPinBoard({ pins }: TodoPinBoardProps) {
    return (
        <section
            aria-labelledby="pin-title"
            className="sticky top-2 z-10 mb-4 rounded-2xl border border-lemon bg-cream shadow-sm p-3"
        >
            <h2
                id="pin-title"
                className="mb-2 flex items-center gap-1 text-sm font-semibold"
            >
                <BsPinAngleFill aria-hidden />
                고정 {pins.length}/{PIN_MAX}
            </h2>
            {pins.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    카드의 핀 버튼을 눌러 중요한 할 일을 고정해 보세요.
                </p>
            ) : (
                <ul className="space-y-1">
                    {pins.map((todo) => (
                        <li key={todo.id}>
                            <Link
                                href={`/todo/${todo.id}`}
                                className={
                                    todo.status === 'DONE'
                                        ? 'text-sm text-muted-foreground line-through decoration-tomato decoration-2 hover:underline'
                                        : 'text-sm hover:underline'
                                }
                            >
                                {todo.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
