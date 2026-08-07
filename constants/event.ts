// 천국의 계단 출시 이벤트 — 앱→웹 심리스 진입용 상수.
//
// 배너 linkUrl이 아래 이벤트 웹 prefix로 시작할 때만, 앱이 1회용 티켓(POST /event/ticket)을
// 발급해 `?ticket=`으로 실어 보낸다. 그 외 일반 배너 링크에는 티켓을 붙이지 않는다
// (엉뚱한 URL로 티켓이 새는 것 방지). 같은 github.io 오리진에 retreat/·obs-guide/ 등
// 다른 정적 페이지가 있어 오리진이 아니라 이벤트 경로 prefix로 좁혀 매칭한다.
export const EVENT_WEB_URL_PREFIXES = [
  'https://logos-engineers.github.io/loen-site/events/heaven-stairs',
];

/** 이 URL이 천국의 계단 이벤트 웹인지(= 티켓을 붙여야 하는지) 판별. */
export function isEventWebLink(url: string): boolean {
  return EVENT_WEB_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}
