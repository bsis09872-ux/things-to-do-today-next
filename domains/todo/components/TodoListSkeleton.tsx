// 로딩 상태 : 목록을 불러오는 동안 카드 모양 자리만 먼저 보여줌 (화면이 덜컹거리지 않게)
// 회색 상자는 화면 읽기 프로그램에 의미가 없어서 aria-hidden, 대신 sr-only 문장으로 알려줌
export default function TodoListSkeleton() {
    return (
        <div role="status" className="animate-pulse">
            <span className="sr-only">할 일 목록을 불러오는 중…</span>
            <div className="mb-4 space-y-2 border-b pb-3" aria-hidden>
                <div className="h-7 w-28 rounded bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
            </div>
            <ul className="grid gap-3 sm:grid-cols-2" aria-hidden>
                {[1, 2, 3, 4].map((n) => (
                    <li key={n} className="space-y-3 rounded-2xl border p-4">
                        <div className="h-3 w-20 rounded bg-gray-200" />
                        <div className="h-5 w-3/4 rounded bg-gray-200" />
                        <div className="h-7 w-40 rounded bg-gray-200" />
                    </li>
                ))}
            </ul>
        </div>
    );
}