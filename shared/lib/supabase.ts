import {
    createBrowserClient,
    createServerClient as createSSRServerClient,
} from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabasePublishableKey) {
    console.warn(
        'NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해 주세요.',
    );
}

// 서버 컴포넌트, 서버 액션, Route Handler에서 쓰는 Supabase 클라이언트
// 요청마다 쿠키(로그인 정보)를 읽고 쓰기 때문에 호출할 때마다 새로 만든다
export function createServerClient(): SupabaseClient {
    return createSSRServerClient(supabaseUrl, supabasePublishableKey, {
        cookies: {
            async getAll() {
                const { cookies } = await import('next/headers');
                const cookieStore = await cookies();
                return cookieStore.getAll();
            },
            async setAll(cookiesToSet) {
                try {
                    const { cookies } = await import('next/headers');
                    const cookieStore = await cookies();
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                } catch {
                    // 서버 컴포넌트 렌더링 중에는 쿠키를 쓸 수 없으므로 무시하고,
                    // 쿠키 갱신은 서버 액션과 미들웨어에서 처리한다
                }
            },
        },
    });
}

// 클라이언트 컴포넌트(브라우저)에서 쓰는 Supabase 클라이언트 (하나만 만들어 재사용)
export const supabase = createBrowserClient(
    supabaseUrl,
    supabasePublishableKey,
);