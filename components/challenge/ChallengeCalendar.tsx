import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
import { formatYearMonth, toDateString } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  certifiedDates: string[];
  defaultExpanded?: boolean;
}

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

// today 원 색상 — Figma fill_5GJ3TQ
const TODAY_COLOR = '#F75D42';

function buildCalendarDates(date: Date): { day: string; dateString: string }[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const cells: { day: string; dateString: string }[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: '', dateString: '' });
  for (let i = 1; i <= lastDate; i++) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(i).padStart(2, '0');
    cells.push({ day: String(i), dateString: `${year}-${m}-${d}` });
  }
  const remain = cells.length % 7;
  if (remain > 0) {
    for (let i = 0; i < 7 - remain; i++) cells.push({ day: '', dateString: '' });
  }
  return cells;
}

function DateCircle({
  item,
  isCertified,
  isToday,
}: {
  item: { day: string; dateString: string };
  isCertified: boolean;
  isToday: boolean;
}) {
  if (item.day === '') return <View style={styles.circle} />;
  if (isCertified) {
    return (
      <View style={[styles.circle, styles.circleChecked]}>
        <Ionicons name="checkmark" size={spacing.md} color={colors.white} />
      </View>
    );
  }
  if (isToday) {
    return (
      <View style={[styles.circle, styles.circleToday]}>
        <Text style={styles.dayTextWhite}>{item.day}</Text>
      </View>
    );
  }
  return (
    <View style={styles.circle}>
      <Text style={styles.dayText}>{item.day}</Text>
    </View>
  );
}

export function ChallengeCalendar({ certifiedDates, defaultExpanded = false }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expanded, setExpanded] = useState(defaultExpanded);

  const certified = useMemo(() => new Set(certifiedDates), [certifiedDates]);
  const todayStr = toDateString(new Date());
  const allCells = useMemo(() => buildCalendarDates(currentDate), [currentDate]);

  const weekCells = useMemo(() => {
    const idx = allCells.findIndex(c => c.dateString === todayStr);
    const start = idx !== -1 ? Math.floor(idx / 7) * 7 : 0;
    return allCells.slice(start, start + 7);
  }, [allCells, todayStr]);

  const prevMonth = () =>
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <View style={styles.card}>
      {/* 월 헤더 — layout_FQ27V7: padding 12 24, gap 4 */}
      <View style={styles.monthRow}>
        <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={spacing.lg} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{formatYearMonth(currentDate)}</Text>
        <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-forward" size={spacing.lg} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {!expanded ? (
        /* 주간 뷰 — Figma: 요일명 + 날짜 원이 같은 셀에 세로 결합 (layout_SO6NQO) */
        <View style={styles.weekGrid}>
          {weekCells.map((item, i) => (
            <View key={i} style={styles.weekCell}>
              <Text style={styles.weekDayText}>{WEEK_DAYS[i]}</Text>
              <DateCircle
                item={item}
                isCertified={certified.has(item.dateString)}
                isToday={item.dateString === todayStr}
              />
            </View>
          ))}
        </View>
      ) : (
        /* 월간 뷰 — 요일 헤더 1회 + 날짜 그리드 */
        <>
          <View style={styles.weekRow}>
            {WEEK_DAYS.map(d => (
              <View key={d} style={styles.cell}>
                <Text style={styles.weekDayText}>{d}</Text>
              </View>
            ))}
          </View>
          <View style={styles.grid}>
            {allCells.map((item, i) => (
              <View key={i} style={styles.cell}>
                <DateCircle
                  item={item}
                  isCertified={certified.has(item.dateString)}
                  isToday={item.dateString === todayStr}
                />
              </View>
            ))}
          </View>
        </>
      )}

      {/* 구분선 — layout_1806G3: padding 0 16 (인셋) */}
      <View style={styles.separator} />

      {/* 달력 토글 — Caption_12_SB, trans/gray/a2 */}
      <TouchableOpacity style={styles.toggleRow} onPress={() => setExpanded(e => !e)}>
        <Text style={styles.toggleText}>{expanded ? '달력 접기' : '달력 전체보기'}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={spacing.md}
          color={colors.text.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const CIRCLE_SIZE = 32;

const styles = StyleSheet.create({
  // ─── 카드 — layout_JC9ZNE: padding 4px 0 ──────────────────────────────────
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    paddingTop: spacing.xs,
    shadowColor: shadow.color,
    shadowOffset: shadow.card.offset,
    shadowOpacity: shadow.card.opacity,
    shadowRadius: shadow.card.radius,
    elevation: shadow.card.elevation,
  },

  // ─── 월 헤더 — layout_FQ27V7: padding 12 24, gap 4 ───────────────────────
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.smmd,
  },
  monthText: {
    fontSize: fontSize.heading,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },

  // ─── 주간 뷰 — layout_UTVPX7: row, paddingBottom 8 ───────────────────────
  weekGrid: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
  },
  // 각 셀 — layout_SO6NQO: column, center, padding 4 (요일명 + 원 결합)
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.nano,
  },

  // ─── 월간 뷰 ──────────────────────────────────────────────────────────────
  weekRow: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // 날짜 셀 — SO6NQO padding 4 → 월간에선 paddingVertical로 행간 조절
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },

  // ─── 공통: 요일 텍스트 — Body2_14_M ──────────────────────────────────────
  weekDayText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },

  // ─── 날짜 원 — layout_05JVK1: 32×32, radius 999 ──────────────────────────
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleChecked: {
    backgroundColor: colors.primary,
  },
  circleToday: {
    backgroundColor: TODAY_COLOR,
  },
  // Body2_14_SB — fontWeight semibold (600)
  dayText: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    fontWeight: fontWeight.semibold,
  },
  dayTextWhite: {
    fontSize: fontSize.md,
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },

  // ─── 구분선 — layout_1806G3: padding 0 16 (인셋) ─────────────────────────
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },

  // ─── 토글 — Caption_12_SB, trans/gray/a2 ─────────────────────────────────
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.smmd,
  },
  toggleText: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: fontWeight.semibold,
  },
});
