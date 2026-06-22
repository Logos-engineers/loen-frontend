import { colors, fontSize, fontWeight, radius } from '@/constants/tokens';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// 요일 라벨은 각 날짜의 getDay()로 도출한다(주 시작 요일이 바뀌어도 라벨↔날짜 정합 유지). index=getDay(): 일=0
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

interface AttendanceWeekProps {
  /** 일요일(weekStart, 주 시작) YYYY-MM-DD */
  weekStart?: string;
  /** 오늘 YYYY-MM-DD */
  today?: string;
  /** 출석한 날짜 목록 YYYY-MM-DD */
  attendedDates?: string[];
}

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 이번 주 일요일(주 시작) — 로컬 기준 폴백 */
function thisSunday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
}

/**
 * 마이페이지 앱 출석 주간 캘린더.
 * 신앙노트 주간 셀렉터(faith-note-week-selector)와 동일한 원형 디자인을 사용하되,
 * 상호작용 없이 출석 현황만 표시한다. 출석한 날 = 메인 보라색으로 채움(흰 날짜),
 * 오늘(미출석) = 보라 테두리. 서버 데이터가 없을 때도 이번 주 날짜를 로컬 기준으로 표시한다.
 */
export function AttendanceWeek({ weekStart, today, attendedDates = [] }: AttendanceWeekProps) {
  const base = weekStart ? parseYmd(weekStart) : thisSunday();
  const todayYmd = today ?? toYmd(new Date());
  const attended = new Set(attendedDates);

  return (
    <View style={styles.container}>
      {Array.from({ length: 7 }, (_, i) => {
        const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
        const ymd = toYmd(date);
        const isAttended = attended.has(ymd);
        const isToday = ymd === todayYmd;
        const isSunday = date.getDay() === 0;

        return (
          <View key={ymd} style={styles.dayWrapper}>
            <Text style={[styles.dayLabel, isSunday && styles.dayLabelSunday, isToday && styles.dayLabelToday]}>{WEEKDAY[date.getDay()]}</Text>
            <View
              style={[
                styles.circle,
                isAttended && styles.circleActive,
                !isAttended && isToday && styles.circleToday,
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  isAttended && styles.dateTextActive,
                  !isAttended && isToday && styles.dateTextToday,
                ]}
              >
                {date.getDate()}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  dayLabelToday: {
    color: colors.text.primary,
    fontWeight: fontWeight.semibold,
  },
  dayLabelSunday: {
    color: colors.reaction.red, // 주일(일요일) 강조 — 브랜드 red
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: colors.primary,
  },
  circleToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.background.elevated,
  },
  dateText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
  },
  dateTextToday: {
    color: colors.primary,
  },
  dateTextActive: {
    color: colors.white,
  },
});
