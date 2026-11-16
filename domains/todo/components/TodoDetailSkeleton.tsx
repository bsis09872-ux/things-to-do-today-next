// 로딩 상태 : 상세 · 수정 화면을 불러오는 동안 보여줄 자리
export default function TodoDetailSkeleton() {
    return (
        <div role="status" className="animate-pulse">
            <span className="sr-only">할 일을 불러오는 중…</span>
            <div className="space-y-6 rounded-2xl border p-6" aria-hidden>
                <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="h-8 w-2/3 rounded bg-gray-200" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-gray-200" />
                    <div className="h-4 w-5/6 rounded bg-gray-200" />
                </div>
                <div className="h-8 w-48 rounded bg-gray-200" />
            </div>
        </div>
    );
}
