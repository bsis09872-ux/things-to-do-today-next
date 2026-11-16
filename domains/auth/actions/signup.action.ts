'use server';

import { createServerClient } from '@/shared/lib/supabase';
import type { ActionState } from '@/shared/types/action.types';
import { revalidatePath } from 'next/cache';
import { validateSignUpInput } from '../utils/authValidation';

export interface SignUpResult {
    needsEmailConfirm: boolean; // 이메일 인증이 켜져 있으면 true (아직 로그인 전)
}

export async function signUpAction(
    prevState: ActionState<SignUpResult>,
    formData: FormData,
): Promise<ActionState<SignUpResult>> {
    const name = String(formData.get('name') ?? '');
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');

    const errors = validateSignUpInput({
        name,
        email,
        password,
        passwordConfirm,
    });
    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    const supabase = createServerClient();

    // 1) 비밀번호를 trim 하지 않는다. (로그인은 trim 안 해서 앞뒤 공백이 있으면 로그인이 안 됐다)
    // 2) profiles 를 직접 insert 하지 않고, 이름을 metadata 로 넘기면 DB 트리거(handle_new_user)가 만든다.
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
            data: { name: name.trim() },
        },
    });

    if (signUpError || !authData.user) {
        const msg = signUpError?.message?.toLowerCase() ?? '';
        const isDuplicate =
            msg.includes('already registered') ||
            msg.includes('already exists');

        return {
            success: false,
            message: isDuplicate
                ? '이미 가입된 이메일 주소입니다. 다른 이메일을 사용해 주세요.'
                : '회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        };
    }

    revalidatePath('/', 'layout');

    // 이메일 인증이 꺼져 있으면 session 이 바로 생기고(=로그인 상태), 켜져 있으면 null
    const needsEmailConfirm = !authData.session;

    return {
        success: true,
        message: needsEmailConfirm
            ? '가입 확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요.'
            : '회원가입이 완료되었습니다.',
        data: { needsEmailConfirm },
    };
}

