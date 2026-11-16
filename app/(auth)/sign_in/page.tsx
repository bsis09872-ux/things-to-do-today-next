import SignInForm from '@/domains/auth/components/SignInForm';
import { Suspense } from 'react';

export const metadata = { title: '로그인' };

export default function SignInPage() {
    return (
        <>
            <h1 className="mb-6 text-2xl font-bold">로그인</h1>
            {/* SignInForm 이 주소창 값(useSearchParams)을 읽기 때문에 Suspense 로 감싼다.
                감싸지 않으면 Cache Components 규칙 때문에 빌드 에러가 난다. */}
            <Suspense>
                <SignInForm />
            </Suspense>
        </>
    );
}
