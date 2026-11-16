import UserMenu from '@/domains/auth/components/UserMenu';
import Link from 'next/link';
import { Suspense } from 'react';

// 로그인한 사람만 보는 화면들의 공통 틀 (비로그인 접근은 proxy.ts 가 막는다)
export default function TodoLayout({ children }: LayoutProps<'/'>) {
    return (
        <div className="mx-auto w-full max-w-3xl px-4">
            <header className="flex items-center justify-between py-6">
                <Link href="/" className="text-xl font-bold">
                    Tdl
                </Link>
                {/* 쿠키를 읽는 부분만 Suspense 로 감싸서, 나머지 화면은 먼저 보여 준다 */}
                <Suspense fallback={<span className="text-sm">…</span>}>
                    <UserMenu />
                </Suspense>
            </header>
            <main>{children}</main>
        </div>
    );
}
