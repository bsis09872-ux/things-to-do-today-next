'use client';

import FieldError from '@/domains/auth/components/FieldError';
import FormMessage from '@/domains/auth/components/FormMessage';
import { Button, buttonVariants } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { INITIAL_ACTION_STATE } from '@/shared/types/action.types';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { addTodoAction, updateTodoAction } from '../actions/todo.actions';
import type { Todo } from '../types/todo.types';
import { CONTENT_MAX, TITLE_MAX } from '../utils/todoValidation';

interface TodoFormProps {
    todo?: Todo; // 있으면 수정 폼, 없으면 등록 폼
}

// 등록 · 수정을 한 컴포넌트로 처리 (props로 todo를 받으면 수정 모드)
// 'use client' : 입력값 상태(useState)와 제출 상태(useActionState)를 다룸
export default function TodoForm({ todo }: TodoFormProps) {
    const isEdit = !!todo;

    // 폼(useActionState)은 (prevState, formData) 두 개만 넘겨줌
    // -> 수정은 bind로 첫 번째 값(id)을 미리 채운 함수를 만들어 씀
    //    (hidden input보다 안전하고, JS 없이도 동작)
    const action = isEdit
        ? updateTodoAction.bind(null, todo.id)
        : addTodoAction;

    const [state, formAction, isPending] = useActionState(
        action,
        INITIAL_ACTION_STATE,
    );

    // 제출 후 에러가 나도 입력한 값이 지워지지 않게 직접 상태로 관리
    const [form, setForm] = useState({
        title: todo?.title ?? '',
        dueDate: todo?.dueDate ?? '',
        content: todo?.content ?? '',
    });

    const onChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    return (
        <>
            <FormMessage message={state.message} />

            <form action={formAction} noValidate className="space-y-5">
                <div>
                    <label htmlFor="title" className="mb-1 block text-sm">
                        제목
                    </label>
                    <Input
                        id="title"
                        name="title"
                        placeholder="할 일의 제목을 지어 주세요."
                        maxLength={TITLE_MAX}
                        value={form.title}
                        onChange={onChange}
                        aria-invalid={!!state.errors?.title}
                        autoFocus
                    />
                    <FieldError message={state.errors?.title} />
                </div>

                <div>
                    <label htmlFor="dueDate" className="mb-1 block text-sm">
                        마감일{' '}
                        <span className="text-muted-foreground">(선택)</span>
                    </label>
                    <Input
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={form.dueDate}
                        onChange={onChange}
                        aria-invalid={!!state.errors?.dueDate}
                    />
                    <FieldError message={state.errors?.dueDate} />
                </div>

                <div>
                    <label htmlFor="content" className="mb-1 block text-sm">
                        메모{' '}
                        <span className="text-muted-foreground">(선택)</span>
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        rows={5}
                        maxLength={CONTENT_MAX}
                        placeholder="할 일이 무엇인가요?"
                        value={form.content}
                        onChange={onChange}
                        aria-invalid={!!state.errors?.content}
                        className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                    <FieldError message={state.errors?.content} />
                </div>

                <div className="flex justify-end gap-2">
                    {/* 취소 : 수정이면 상세로, 등록이면 목록으로 */}
                    <Link
                        href={isEdit ? `/todo/${todo.id}` : '/'}
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        취소
                    </Link>
                    <Button type="submit" disabled={isPending}>
                        {isPending
                            ? '저장 중...'
                            : isEdit
                              ? '수정하기'
                              : '등록하기'}
                    </Button>
                </div>
            </form>
        </>
    );
}
