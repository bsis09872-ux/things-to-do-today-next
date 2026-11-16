'use client';

import { Button, buttonVariants } from '@/shared/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

// 에러 상태 : (todo) 안의 페이지에서 에러가 나면 이 화면으로 바뀜 (헤더는 그대로)
// 'use client' : 에러 경계(Error Boundary)는 React 규칙상 클라이언트 컴포넌트여야 함
// Next 16 : 다시 시도는 retry() (데이터를 다시 불러와서 그림). reset()은 다시 불러오지 않아서 안 씀
export default function TodoError({
    error,
    retry,
}: {
    error: unknown; // 클라이언트에서 던진 값은 Error가 아닐 수도 있어서 unknown
    retry: () => void;
}) {
    useEffect(() => {
        // 배포 환경에서는 화면에 자세한 에러 내용을 안 보여줌 (보안) -> 콘솔에만 남김
        console.error(error);
    }, [error]);

    return (
        <section role="alert" className="space-y-4 py-16 text-center">
            <FiAlertTriangle
                className="mx-auto size-10 text-red-500"
                aria-hidden
            />
            <h1 className="text-xl font-bold">문제가 생겼어요</h1>
            <p className="text-sm text-gray-500">
                잠시 후 다시 시도해 주세요. 계속 안 되면 새로고침해 보세요.
            </p>
            <div className="flex justify-center gap-2">
                <Button type="button" onClick={() => retry()}>
                    <FiRefreshCw aria-hidden />
                    다시 시도
                </Button>
                <Link
                    href="/"
                    className={buttonVariants({ variant: 'outline' })}
                >
                    목록으로
                </Link>
            </div>
        </section>
    );
}