import { getCurrentUser } from '../queries/getCurrentUser.query';
import SignOutButton from './SignOutButton';

// 서버 컴포넌트 ('use client' 없음):
// 로그인한 사람을 서버에서 쿠키로 확인한다 → 토큰 확인 로직이 브라우저로 내려가지 않는다.
// 쿠키를 읽으므로 반드시 <Suspense> 안에서 써야 한다 (Cache Components 규칙).
// 버튼처럼 클릭이 필요한 부분(SignOutButton)만 클라이언트 컴포넌트로 떼어 냈다.
export default async function UserMenu() {
    const user = await getCurrentUser();

    if (!user) return null;

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm">
                <strong>{user.name}</strong> 님
            </span>
            <SignOutButton />
        </div>
    );
}
