// 날짜를 한국 시간으로 보여줌
// 서버는 세계 표준으로 돌아가서 timeZone을 안 정하면 9시간 어긋나 보일 수 있음.
const dateTimeformatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'medium',
    timeStyle: 'short',
});

export function formatDateTime(iso: string): string {
    return dateTimeformatter.format(new Date(iso));
}
