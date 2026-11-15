import { updateSession } from "@/shared/lib/supabaseProxy";
import type { NextRequest } from "next/server";

export async function proxy (request:NextRequest) {
    return await updateSession(request);
}

export const config = {
    // 이미지 · 정적 파일 요청에는 실행하지 않는다
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};