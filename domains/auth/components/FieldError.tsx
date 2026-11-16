import { FiAlertCircle } from 'react-icons/fi';

interface FieldErrorProps {
    message?: string;
}

// 입력칸 아래에 붙는 에러 한 줄 (메시지가 없으면 아무것도 그리지 않음)
// 서버 컴포넌트 · 클라이언트 컴포넌트 어디서든 쓸 수 있는 단순 표시용 컴포넌트
export default function FieldError({ message }: FieldErrorProps) {
    if (!message) return null;

    return (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
            <FiAlertCircle className="size-3.5 shrink-0" aria-hidden />
            {message}
        </p>
    );
}