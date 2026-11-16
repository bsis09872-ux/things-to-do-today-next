import type { Todo, TodoRow } from '../types/todo.types';

// DB 모양(snake_case) → 앱 모양(camelCase)으로 바꾼다.
export function toTodo(row: TodoRow): Todo {
    return {
        id: row.id,
        userId: row.user_id,
        userName: row.user_name,
        status: row.status,
        title: row.title,
        content: row.content,
        dueDate: row.due_date,
        pinnedAt: row.pinned_at,
        sortOrder: row.sort_order,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
    };
}
