import { buttonVariants } from '@/shared/components/ui/button';
import Link from 'next/link';

export const metadata = { title: '페이지를 찾을 수 없어요' };

// 전체 404 : 없는 주소로 들어오면 이 화면이 뜸 (예: /abcd)
// 루트 레이아웃 바로 아래라서 (todo) 헤더는 없음
export default function NotFound() {
    return (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
            <p className="text-5xl font-bold text-gray-300">404</p>
            <h1 className="text-xl font-bold">페이지를 찾을 수 없어요</h1>
            <p className="text-sm text-gray-500">주소를 다시 확인해 주세요.</p>
            <Link href="/" className={buttonVariants()}>
                홈으로
            </Link>
        </main>
    );
}
