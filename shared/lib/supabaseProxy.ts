import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// =====================================================================
// [접근 제어] 차단 목록(블랙리스트) 대신 허용 목록(화이트리스트) 방식
// ---------------------------------------------------------------------
// 차단 목록 방식 : "막을 페이지"를 하나씩 적음
//     const isProtectedPath = pathname === '/' || pathname.startsWith('/todo');
//   → /trash, /settings 처럼 새 페이지를 만들고 여기 추가하는 걸 잊으면
//     로그인 안 한 사람도 들어올 수 있다. 에러도 안 나서 알아채기 어렵다.
//
// 이 코드 (허용 목록) : "열어 둘 페이지"만 적고, 나머지는 전부 막는다
//   → 새 페이지는 기본으로 잠겨 있다 (deny by default).
//     깜빡해도 "열려야 할 페이지가 잠기는" 쪽으로만 실수하게 되고,
//     그건 화면에서 바로 보이니 보안 구멍으로 이어지지 않는다.
//
// 로그인 없이 들어갈 수 있는 페이지 (여기 없는 주소는 전부 로그인 필요)
// =====================================================================
const AUTH_PAGES = ['/sign_in', '/sign_up'];

// 허용 목록 비교는 정확하게 한다.
// startsWith('/sign_in') 만 쓰면 '/sign_in_admin' 같은 다른 주소까지 허용 목록에 걸린다.
// → 주소가 똑같거나('/sign_in'), 그 아래 경로('/sign_in/...')일 때만 허용
function isAuthPath(pathname: string): boolean {
    return AUTH_PAGES.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
}

// 모든 요청이 페이지에 닿기 전에 실행된다 (proxy.ts 에서 호출)
// 1) 만료가 다가온 로그인 쿠키를 새로 고쳐 주고
// 2) 로그인 여부에 따라 페이지 접근을 막는다
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                // 새 쿠키를 요청(이번에 그릴 페이지)과 응답(브라우저) 양쪽에 넣는다
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value),
                );
                supabaseResponse = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options),
                );
            },
        },
    });

    // getUser() 는 Supabase 서버에 토큰을 검증받는다 (위조된 쿠키를 걸러냄)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname, search } = request.nextUrl;
    const isAuthPage = isAuthPath(pathname);

    // 이미 로그인한 사람이 로그인/회원가입 페이지에 오면 → 홈으로
    if (user && isAuthPage) {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = '/';
        homeUrl.search = '';
        return NextResponse.redirect(homeUrl);
    }

    // 로그인 안 한 사람이 허용 목록(AUTH_PAGES) 밖의 페이지에 오면 → 로그인 페이지로
    // (허용 목록 방식을 쓴 이유는 파일 위쪽 AUTH_PAGES 주석 참고)
    if (!user && !isAuthPage) {
        const signInUrl = request.nextUrl.clone();
        signInUrl.pathname = '/sign_in';
        signInUrl.search = '';
        // 로그인 후 원래 보던 페이지로 돌아가도록 (?filter=done 같은 쿼리도 함께)
        signInUrl.searchParams.set('redirectUrl', pathname + search);
        return NextResponse.redirect(signInUrl);
    }

    return supabaseResponse;
}
