import { createServerClient } from '@/shared/lib/supabase';
import { cache } from 'react';
import type { UserProfile } from '../types/auth.types';

// 서버에서 "지금 로그인한 사람"을 가져온다.
// cache(): 한 번의 요청 안에서 여러 컴포넌트가 불러도 Supabase 에는 한 번만 물어본다.
export const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
    const supabase = createServerClient();

    // getSession() 이 아니라 getUser() : 쿠키 값을 그대로 믿지 않고 Supabase 서버에 검증을 받는다
    const {
        data: { user: authUser },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, created_at, updated_at, deleted_at')
        .eq('id', authUser.id)
        .is('deleted_at', null)
        .maybeSingle();

    if (!profile) return null;

    return {
        id: profile.id,
        name: profile.name,
        email: authUser.email,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        deletedAt: profile.deleted_at,
    };
});