import UserMenu from '@/domains/auth/components/UserMenu';
import Brand from '@/shared/components/Brand';
import Link from 'next/link';
import { FiTrash2 } from 'react-icons/fi';
import { Suspense } from 'react';

// 로그인한 사람만 보는 화면들의 공통 틀 (비로그인 접근은 proxy.ts 가 막는다)
export default function TodoLayout({ children }: LayoutProps<'/'>) {
    return (
        <div className="mx-auto w-full max-w-3xl px-4">
            <header className="flex items-center justify-between py-6">
                <Link href="/" aria-label="Things to do today 홈">
                    <Brand />
                </Link>
                <div className="flex items-center gap-3">
                    <Link
                        href="/trash"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"
                    >
                        <FiTrash2 aria-hidden />
                        휴지통
                    </Link>
                    {/* 쿠키를 읽는 부분만 Suspense 로 감싸서, 나머지 화면은 먼저 보여 준다 */}
                    <Suspense fallback={<span className="text-sm">…</span>}>
                        <UserMenu />
                    </Suspense>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
}
