import type { TodoFilter, TodoSort } from '../utils/todoView';
import { TODO_FILTERS, TODO_SORTS } from '../utils/todoView';

interface TodoToolbarProps {
    filter: TodoFilter;
    sort: TodoSort;
    counts: Record<TodoFilter, number>; // 필터마다 몇 개인지
    onFilterChange: (filter: TodoFilter) => void;
    onSortChange: (sort: TodoSort) => void;
}

// 필터 버튼 + 정렬 선택. 값은 부모(TodoDashboard)가 갖고, 여기는 그리기와 알리기만 함
export default function TodoToolbar({
    filter,
    sort,
    counts,
    onFilterChange,
    onSortChange,
}: TodoToolbarProps) {
    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1" role="group" aria-label="필터">
                {(Object.keys(TODO_FILTERS) as TodoFilter[]).map((key) => {
                    const isCurrent = key === filter;
                    return (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={isCurrent}
                            onClick={() => onFilterChange(key)}
                            className={
                                isCurrent
                                    ? 'rounded-full bg-gray-900 px-3 py-1 text-sm text-white'
                                    : 'rounded-full border px-3 py-1 text-sm hover:bg-gray-100'
                            }
                        >
                            {TODO_FILTERS[key].label} {counts[key]}
                        </button>
                    );
                })}
            </div>

            <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">정렬</span>
                <select
                    value={sort}
                    onChange={(e) => onSortChange(e.target.value as TodoSort)}
                    className="rounded-lg border px-2 py-1"
                >
                    {(Object.keys(TODO_SORTS) as TodoSort[]).map((key) => (
                        <option key={key} value={key}>
                            {TODO_SORTS[key].label}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
}
