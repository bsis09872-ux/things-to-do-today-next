import { buttonVariants } from '@/shared/components/ui/button';
import Link from 'next/link';

// 할 일 404 : 상세 · 수정 페이지에서 notFound()를 부르면 이 화면이 뜸
// (없는 id, 남의 할 일, 휴지통에 있는 할 일, /todo/abc 처럼 형식이 틀린 주소)
export default function TodoNotFound() {
    return (
        <section className="space-y-4 py-16 text-center">
            <p className="text-5xl font-bold text-muted-foreground/40">404</p>
            <h1 className="text-xl font-bold">할 일을 찾을 수 없어요</h1>
            <p className="text-sm text-muted-foreground">
                삭제됐거나 주소가 잘못됐을 수 있어요.
            </p>
            <Link href="/" className={buttonVariants()}>
                목록으로
            </Link>
        </section>
    );
}
