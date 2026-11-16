// =====================================================================
// 'use server' : 이 파일의 함수들을 "서버 액션"으로 만든다
// ---------------------------------------------------------------------
// - App Router 는 아무 표시가 없으면 기본이 서버 컴포넌트라서,
//   'use server' 는 "서버 컴포넌트" 표시가 아니다.
// - 뜻은 "브라우저(클라이언트 컴포넌트)에서 불러도, 실행은 서버에서 하는 함수".
//   로그인 폼(SignInForm)은 'use client' 라 이 함수를 import 하는데,
//   'use server' 가 있으면 함수 코드는 서버에만 남고 브라우저에는 "서버에 요청하는 연결"만 내려간다.
//   없으면 이 코드가 통째로 브라우저 번들에 들어가서 쿠키 처리(next/headers)가 깨진다.
// - 서버 액션은 누구나 호출할 수 있는 공개 API 주소가 되므로,
//   폼에서 검사했더라도 여기서 입력값을 다시 검사한다 (validateSignInInput).
// =====================================================================
'use server';

import { createServerClient } from '@/shared/lib/supabase';
import type { ActionState } from '@/shared/types/action.types';
import { revalidatePath } from 'next/cache';
import { validateSignInInput } from '../utils/authValidation';

export async function signInAction(
    prevState: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const email = String(formData.get('email') ?? '');

    // [비밀번호는 trim 하지 않는다]
    // - 비밀번호의 앞뒤 공백도 사용자가 입력한 비밀번호의 일부로 본다.
    //   (NIST 비밀번호 가이드라인 : 공백 포함 모든 문자를 허용하고, 입력값을 몰래 바꾸지 말 것)
    // - 가입에서만 trim 하면 ' abc12345' 로 가입 -> 'abc12345' 저장,
    //   로그인은 ' abc12345' 로 시도해서 실패함.
    // - 가입 · 로그인 둘 다 trim 하지 않아서 항상 같은 값으로 비교되게 맞췄다.
    // - 이메일은 앞뒤 공백이 실수일 뿐이라 trim 한다 (아래 signInWithPassword).
    const password = String(formData.get('password') ?? '');

    const errors = validateSignInInput({ email, password });
    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    const supabase = createServerClient();

    const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

    if (signInError || !authData.user) {
        // 이메일이 없는지, 비밀번호가 틀렸는지 구분하지 않는다
        // (구분해서 알려 주면 "이 이메일은 가입돼 있다"는 정보가 새어 나간다)
        return {
            success: false,
            message: '이메일 또는 비밀번호가 일치하지 않습니다.',
        };
    }

    // 로그인은 됐지만, 프로필이 없거나 탈퇴 처리된 계정이면 다시 로그아웃시킨다
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, deleted_at')
        .eq('id', authData.user.id)
        .maybeSingle(); // 결과가 없으면 에러 대신 null

    // Supabase 는 DB 칸 이름을 그대로 돌려줌 -> { id, deleted_at }
    // deletedAt 으로 읽으면 늘 undefined -> 탈퇴한 계정도 로그인됨. 그래서 deleted_at 으로 읽음.
    if (!profile || profile.deleted_at) {
        await supabase.auth.signOut();
        return {
            success: false,
            message: '존재하지 않는 계정입니다.',
        };
    }

    // [로그인 후 화면 다시 그리기]
    // Next 는 한 번 그린 화면을 저장해 두고(캐시) 재사용한다.
    // 그대로 두면 로그인 전에 그린 화면(이름 없는 헤더 등)이 계속 보일 수 있어서,
    // 저장해 둔 화면을 버리고 로그인한 상태로 새로 그리게 한다.
    // ('/' + 'layout' = 루트 레이아웃을 쓰는 모든 페이지 = 사이트 전체)
    revalidatePath('/', 'layout');

    // 이 메시지와 success 를 받은 로그인 폼이 원래 가려던 페이지로 이동시킨다
    return { success: true, message: '로그인되었습니다.' };
}
