import Image from 'next/image';

interface BrandProps {
    size?: 'sm' | 'lg'; // sm : 헤더, lg : 로그인 · 회원가입 화면
}

// 로고 + "Things to do today" 제목 (1차 과제 로고 · 타이포 그대로)
// today 만 Instrument Serif 이탤릭으로 포인트
export default function Brand({ size = 'sm' }: BrandProps) {
    const isLarge = size === 'lg';

    return (
        <span className="flex items-center gap-2">
            {/* SVG 는 이미 가벼워서 Next 이미지 최적화를 거치지 않음 (unoptimized) */}
            <Image
                src="/logo.svg"
                alt=""
                width={isLarge ? 44 : 32}
                height={isLarge ? 44 : 32}
                unoptimized
                priority
            />
            <span
                className={
                    isLarge
                        ? 'text-2xl font-bold tracking-tight'
                        : 'text-lg font-bold tracking-tight'
                }
            >
                Things to do{' '}
                <i className="font-serif font-normal text-tomato">today</i>
            </span>
        </span>
    );
}
