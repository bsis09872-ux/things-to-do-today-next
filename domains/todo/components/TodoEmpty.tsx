import { buttonVariants } from '@/shared/components/ui/button';
import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';

interface TodoEmptyProps {
    cheer: string; // 서버에서 골라 준 응원 문구
}

// 빈 상태 : 할 일이 하나도 없을 때. 다음에 할 행동(등록)을 바로 누를 수 있게 버튼을 같이 둠
export default function TodoEmpty({ cheer }: TodoEmptyProps) {
    return (
        <div className="space-y-3 rounded-2xl border border-dashed py-16 text-center">
            <p className="font-medium">등록된 할 일이 없어요</p>
            <p className="text-sm text-gray-500">{cheer}</p>
            <Link
                href="/todo/new"
                className={buttonVariants({ variant: 'outline' })}
            >
                <FiPlus aria-hidden />첫 할 일 등록하기
            </Link>
        </div>
    );
}
