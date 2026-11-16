import type { Metadata } from 'next';
import { IBM_Plex_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';

// 포인트 이탤릭 (Things to do *today*)
const instrumentSerif = Instrument_Serif({
    variable: '--font-instrument-serif',
    subsets: ['latin'],
    weight: '400',
    style: ['normal', 'italic'],
});

// 날짜 · 라벨
const plexMono = IBM_Plex_Mono({
    variable: '--font-plex-mono',
    subsets: ['latin'],
    weight: ['400', '500'],
});

export const metadata: Metadata = {
    title: {
        default: 'Things to do today · Tdl',
        template: '%s · Tdl',
    },
    description: '오늘 할 일을 관리하는 Todo 앱',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html
            lang="ko"
            className={`${instrumentSerif.variable} ${plexMono.variable} h-full antialiased`}
        >
            <head>
                {/* 한글 본문 폰트 Pretendard : Google Fonts 에 없어서 1차 과제처럼 CDN 으로 불러옴
                    dynamic-subset : 화면에 쓰인 글자 조각만 내려받아서 가벼움 */}
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
                />
            </head>
            <body className="flex min-h-full flex-col">{children}</body>
        </html>
    );
}
