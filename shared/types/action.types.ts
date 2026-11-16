// 서버 액션이 폼에 돌려주는 결과 모양 (모든 액션 공유)
export interface ActionState<T = unknown> {
    success: boolean;
    message?: string; //폼 위에 띄울 전체 메시지
    errors?: Record<string, string>; //칸 별 에러 메시지
    data?: T;
}

export const INITIAL_ACTION_STATE: ActionState = {
    success: false,
};
