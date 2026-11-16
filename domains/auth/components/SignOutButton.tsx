'use client';

import { Button } from '@/shared/components/ui/button';
import { useTransition } from 'react';
import { FiLogOut } from 'react-icons/fi';
import { logoutAction } from '../actions/logout.action';

// 'use client' 인 이유: 클릭 이벤트와 로그아웃 후 페이지 이동은 브라우저에서 일어난다.
export default function SignOutButton() {
    // useTransition: 서버 액션이 끝날 때까지 isPending 이 true
    const [isPending, startTransition] = useTransition();

    const onLogout = () => {
        startTransition(async () => {
            const result = await logoutAction();
            if (result.success) {
                // router.replace 대신 페이지를 완전히 새로 연다.
                // 앱 안에서만 화면을 바꾸면, 로그인 상태일 때 미리 불러온 화면(예: /sign_up → '/'로 이동)이
                // 브라우저 메모리에 남아 로그아웃 후에도 엉뚱하게 이동한다.
                // 새로 열면 메모리가 통째로 비워져서, 이전 사용자의 화면 · 데이터도 남지 않는다 (보안상 이점).
                window.location.replace('/sign_in');
            } else {
                alert(result.message ?? '로그아웃에 실패했습니다.');
            }
        });
    };
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={onLogout}
        >
            <FiLogOut aria-hidden />
            {isPending ? '로그아웃 중...' : '로그아웃'}
        </Button>
    );
}
