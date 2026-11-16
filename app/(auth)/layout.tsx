import Brand from '@/shared/components/Brand';

// 로그인 · 회원가입 화면 공통 틀 (로고 + 가운데 카드)
// 서버 컴포넌트: 상태나 이벤트가 없는 단순한 틀이라 서버에서 HTML 로 만들어 보낸다
export default function AuthLayout({ children }: LayoutProps<'/'>) {
    return (
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
            <Brand size="lg" />
            <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
                {children}
            </div>
        </main>
    );
}
