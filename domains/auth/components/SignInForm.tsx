'use client';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { INITIAL_ACTION_STATE } from '@/shared/types/action.types';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { signInAction } from '../actions/login.action';
import { getSafeRedirect } from '../utils/safeRedirect';
import FieldError from './FieldError';
import FormMessage from './FormMessage';

// 'use client' 인 이유: 입력값 상태(useState), 제출 상태(useActionState),
// 로그인 성공 후 페이지 이동(useRouter) 처럼 브라우저에서만 되는 일을 한다.
export default function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // 주소창 값을 그대로 쓰지 않고, 사이트 안 경로인지 검사한 뒤 쓴다 (오픈 리다이렉트 차단)
    const redirectUrl = getSafeRedirect(searchParams.get('redirectUrl'));

    const [state, formAction, isPending] = useActionState(
        signInAction,
        INITIAL_ACTION_STATE,
    );

    // 제출 후에도 이메일이 지워지지 않도록 직접 상태로 관리
    // (비밀번호는 보안상 제출할 때마다 비워지는 게 맞아서 상태로 두지 않는다)
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (state.success) {
            router.replace(redirectUrl); // replace: 뒤로 가기를 눌러도 로그인 화면으로 돌아오지 않게
            router.refresh();
        }
    }, [state.success, redirectUrl, router]);

    return (
        <>
            <FormMessage message={state.success ? undefined : state.message} />

            <form action={formAction} noValidate className="space-y-4">
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        autoComplete="current-password"
                        aria-invalid={!!state.errors?.password}
                    />
                    <FieldError message={state.errors?.password} />
                </div>

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? '로그인 중...' : '로그인'}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm">
                아직 계정이 없나요?{' '}
                <Link href="/sign_up" className="underline">
                    회원가입
                </Link>
            </p>
        </>
    );
}
