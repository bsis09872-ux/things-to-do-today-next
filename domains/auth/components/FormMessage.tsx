import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface FormMessageProps {
    message?: string;
    success?: boolean;
}

// 폼 맨 위에 뜨는 전체 메시지 (성공이면 초록, 실패면 빨강)
export default function FormMessage({ message, success }: FormMessageProps) {
    if (!message) return null;

    const Icon = success ? FiCheckCircle : FiAlertCircle;

    return (
        <div
            role={success ? 'status' : 'alert'}
            className={
                success
                    ? 'mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700'
                    : 'mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600'
            }
        >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span>{message}</span>
        </div>
    );
}