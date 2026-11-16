'use server';

import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import { createServerClient } from '@/shared/lib/supabase';
import type { ActionState } from '@/shared/types/action.types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { TodoInput, TodoStatus } from '../types/todo.types';
import { isTodoStatus } from '../utils/todoStatus';
import { PIN_MAX } from '../utils/todoView';
import { isUuid, validateTodoInput } from '../utils/todoValidation';

// 서버 액션은 누구나 호출 할 수 있는 공개 API라서, 모든 액션이 (1)로그인 확인 (2) 입력값 검사를 스스로 한다. 화면에서 막았더라도 다시 한다.

const LOGIN_REQUIRED: ActionState = {
    success: false,
    message: '로그인이 필요합니다. 다시 로그인해 주세요.',
};

// 폼 값을 꺼내서 TodoInput 모양으로 만든다. (등록 / 수정 공통 적용)
function readTodoForm(formData: FormData): TodoInput {
    return {
        title: String(formData.get('title') ?? ''),
        content: String(formData.get('content') ?? ''),
        dueDate: String(formData.get('dueDate') ?? ''),
    };
}

// 등록 (Create)
export async function addTodoAction(
    prevState: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const user = await getCurrentUser();
    if (!user) return LOGIN_REQUIRED;

    const input = readTodoForm(formData);
    const errors = validateTodoInput(input);
    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    const supabase = createServerClient();

    const { error } = await supabase.from('todos').insert({
        user_id: user.id,
        user_name: user.name,
        status: 'READY',
        title: input.title.trim(),
        content: input.content.trim(),
        due_date: input.dueDate || null, // '' 이면 마감일 없음
    });
    if (error) {
        console.error('할 일 등록 실패:', error.message);
        return { success: false, message: '할 일 등록에 실패했습니다.' };
    }

    // 목록 화면의 저장본(캐시)을 버리고 새 할 일이 보이게 다시 그린다
    revalidatePath('/');
    // 등록이 끝나면 목록으로 이동 (redirect 는 이 아래 코드를 실행하지 않고 바로 이동시킨다)
    redirect('/');
}

// 수정 (Update)
// 폼에서 updateTodoAction.bind(null, id) 로 id 를 미리 묶어서 쓴다.
export async function updateTodoAction(
    id: string,
    prevState: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const user = await getCurrentUser();
    if (!user) return LOGIN_REQUIRED;

    if (!isUuid(id)) {
        return { success: false, message: '잘못된 요청입니다.' };
    }

    const input = readTodoForm(formData);
    const errors = validateTodoInput(input);
    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('todos')
        .update({
            title: input.title.trim(),
            content: input.content.trim(),
            due_date: input.dueDate || null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .select('id')
        .maybeSingle(); // 바뀐 행이 없으면 null (남의 것 · 지워진 것)

    if (error || !data) {
        return {
            success: false,
            message: '할 일을 찾을 수 없거나 수정할 수 없습니다.',
        };
    }

    revalidatePath('/');
    revalidatePath(`/todo/${id}`);
    redirect(`/todo/${id}`); // 수정이 끝나면 상세 화면으로
}

// 상태 변경
export async function changeTodoStatusAction(
    id: string,
    status: TodoStatus,
): Promise<ActionState> {
    const user = await getCurrentUser();
    if (!user) return LOGIN_REQUIRED;

    // 브라우저에서 status 에 'HACKED' 같은 값을 보낼 수도 있으니 다시 검사
    if (!isUuid(id) || !isTodoStatus(status)) {
        return { success: false, message: '잘못된 요청입니다.' };
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('todos')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .select('id')
        .maybeSingle();

    if (error || !data) {
        return { success: false, message: '상태를 바꾸지 못했습니다.' };
    }

    revalidatePath('/');
    revalidatePath(`/todo/${id}`);
    return { success: true };
}

// 삭제 (soft delete)
export async function moveTodoToTrashAction(id: string): Promise<ActionState> {
    const user = await getCurrentUser();
    if (!user) return LOGIN_REQUIRED;

    if (!isUuid(id)) {
        return { success: false, message: '잘못된 요청입니다.' };
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('todos')
        // 휴지통으로 갈 때 핀도 풀어 둠 (복구했을 때 핀이 3개를 넘지 않게)
        .update({ deleted_at: new Date().toISOString(), pinned_at: null })
        .eq('id', id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .select('id')
        .maybeSingle();

    if (error || !data) {
        return { success: false, message: '삭제하지 못했습니다.' };
    }

    revalidatePath('/');
    revalidatePath('/trash');
    return { success: true };
}

// 핀 고정 / 해제 (pin = true 면 고정, false 면 해제)
export async function toggleTodoPinAction(
    id: string,
    pin: boolean,
): Promise<ActionState> {
    const user = await getCurrentUser();
    if (!user) return LOGIN_REQUIRED;

    if (!isUuid(id) || typeof pin !== 'boolean') {
        return { success: false, message: '잘못된 요청입니다.' };
    }

    const supabase = createServerClient();

    // 화면에서 막아도 서버에서 한 번 더 : 이미 3개면 더 고정 못 함
    if (pin) {
        const { count, error: countError } = await supabase
            .from('todos')
            .select('id', { count: 'exact', head: true }) // head: 행은 안 받고 개수만
            .eq('user_id', user.id)
            .is('deleted_at', null)
            .not('pinned_at', 'is', null);

        if (countError) {
            return { success: false, message: '핀을 고정하지 못했습니다.' };
        }
        if ((count ?? 0) >= PIN_MAX) {
            return {
                success: false,
                message: `핀은 최대 ${PIN_MAX}개까지 고정할 수 있어요.`,
            };
        }
    }

    const { data, error } = await supabase
        .from('todos')
        .update({ pinned_at: pin ? new Date().toISOString() : null })
        .eq('id', id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .select('id')
        .maybeSingle();

    if (error || !data) {
        return { success: false, message: '핀을 바꾸지 못했습니다.' };
    }

    revalidatePath('/');
    return { success: true };
}

// 휴지통 -> 목록으로 복구
export async function restoreTodoAction(id: string): Promise<ActionState> {
    const user = await getCurrentUser();
    if (!user) return LOGIN_REQUIRED;

    if (!isUuid(id)) {
        return { success: false, message: '잘못된 요청입니다.' };
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('todos')
        .update({ deleted_at: null })
        .eq('id', id)
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null) // 휴지통에 있는 것만
        .select('id')
        .maybeSingle();

    if (error || !data) {
        return { success: false, message: '복구하지 못했습니다.' };
    }

    revalidatePath('/');
    revalidatePath('/trash');
    return { success: true };
}

// 영구 삭제 : DB 에서 실제로 지움 (되돌릴 수 없음)
// 휴지통에 있는 것만 지울 수 있게 해서, 목록에 있는 할 일이 실수로 바로 지워지지 않게 함
export async function deleteTodoForeverAction(
    id: string,
): Promise<ActionState> {
    const user = await getCurrentUser();
    if (!user) return LOGIN_REQUIRED;

    if (!isUuid(id)) {
        return { success: false, message: '잘못된 요청입니다.' };
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null)
        .select('id')
        .maybeSingle();

    if (error || !data) {
        return { success: false, message: '영구 삭제하지 못했습니다.' };
    }

    revalidatePath('/trash');
    return { success: true };
}
