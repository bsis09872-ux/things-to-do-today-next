// [보안] 로그인 후 이동할 주소(redirectUrl)를 검사한다.

// 오픈 리다이렉트(Open Redirect)란?
//   /sign_in?redirectUrl=https://가짜사이트.com 같은 링크를 만들어 보내면,
//   사용자는 진짜 우리 사이트에서 로그인했는데 로그인 직후 가짜 사이트로 이동된다.
//   가짜 사이트가 "다시 로그인하세요"라고 속여 비밀번호를 훔치는 데 쓰인다.

// 그래서 "우리 사이트 안의 경로"일 때만 그 주소를 쓰고, 아니면 홈('/')으로 보낸다.
export function getSafeRedirect(url: string | null | undefined): string {
    // 값이 없거나 '/'로 시작하지 않으면 (예: 'https://evil.com', 'javascript:...') → 홈
    if (!url || !url.startsWith('/')) return '/';

    // 문자열 모양만 보면 '//evil.com', '/\evil.com', '/(탭)/evil.com' 처럼
    // 브라우저가 외부 주소로 해석하는 우회 방법을 다 막기 어렵다.
    // 그래서 브라우저와 같은 규칙(URL 생성자)으로 직접 해석해 본다.
    const BASE = 'http://localhost'; // 비교용 가짜 기준 주소 (실제로 접속하지 않음)

    try {
        const parsed = new URL(url, BASE);

        // 해석한 결과가 기준 주소와 다른 사이트를 가리키면 → 외부로 나가는 주소 → 홈
        if (parsed.origin !== BASE) return '/';

        // 안전하면 경로 + 쿼리 + 해시만 꺼내서 쓴다 (예: '/todo/1?filter=done')
        return parsed.pathname + parsed.search + parsed.hash;
    } catch {
        // 해석조차 안 되는 이상한 값 → 홈
        return '/';
    }
}
