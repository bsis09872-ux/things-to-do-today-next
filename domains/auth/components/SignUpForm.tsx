'use client';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { signUpAction } from '../actions/signup.action';
import FieldError from './FieldError';
import FormMessage from './FormMessage';

// 'use client' 인 이유: 입력값 상태, 제출 상태, 가입 후 페이지 이동을 브라우저에서 처리한다.
export default function SignUpForm() {
    const router = useRouter();

    const [state, formAction, isPending] = useActionState(signUpAction, {
        success: false,
    });

    const [form, setForm] = useState({ name: '', email: '' });

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    useEffect(() => {
        // 이메일 인증이 꺼져 있으면 가입과 동시에 로그인된 상태 → 바로 홈으로
        if (state.success && !state.data?.needsEmailConfirm) {
            router.replace('/');
            router.refresh();
        }
    }, [state.success, state.data?.needsEmailConfirm, router]);

    // 이메일 인증이 켜져 있으면 폼 대신 "메일 확인하세요" 안내만 보여 준다
    if (state.success && state.data?.needsEmailConfirm) {
        return (
            <>
                <FormMessage message={state.message} success />
                <Link href="/sign_in" className="text-sm underline">
                    로그인 화면으로
                </Link>
            </>
        );
    }

    return (
        <>
            <FormMessage message={state.success ? undefined : state.message} />

            <form action={formAction} noValidate className="space-y-4">
                <div>
                    <label htmlFor="name" className="mb-1 block text-sm">
                        이름
                    </label>
                    <Input
                        id="name"
                        name="name"
                        autoComplete="nickname"
                        placeholder="2자 이상"
                        value={form.name}
                        onChange={onChange}
                        aria-invalid={!!state.errors?.name}
                    />
                    <FieldError message={state.errors?.name} />
                </div>

                <div>
                    <label htmlFor="email" className="mb-1 block text-sm">
                        이메일
                    </label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={onChange}
                        aria-invalid={!!state.errors?.email}
                    />
                    <FieldError message={state.errors?.email} />
                </div>

                <div>
                    <label htmlFor="password" className="mb-1 block text-sm">
                        비밀번호
                    </label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        placeholder="8자 이상"
                        aria-invalid={!!state.errors?.password}
                    />
                    <FieldError message={state.errors?.password} />
                </div>

                <div>
                    <label
                        htmlFor="passwordConfirm"
                        className="mb-1 block text-sm"
                    >
                        비밀번호 확인
                    </label>
                    <Input
                        id="passwordConfirm"
                        type="password"
                        name="passwordConfirm"
                        autoComplete="new-password"
                        aria-invalid={!!state.errors?.passwordConfirm}
                    />
                    <FieldError message={state.errors?.passwordConfirm} />
                </div>

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? '가입하는 중...' : '가입하기'}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm">
                이미 계정이 있나요?{' '}
                <Link href="/sign_in" className="underline">
                    로그인
                </Link>
            </p>
        </>
    );
}
