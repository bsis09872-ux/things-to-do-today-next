import TodoForm from '@/domains/todo/components/TodoForm';

export const metadata = { title: '새 할 일' };

export default function NewTodoPage() {
    return (
        <section className="mx-auto max-w-xl">
            <h1 className="mb-6 text-2xl font-bold">새 할 일</h1>
            <TodoForm />
        </section>
    );
}
