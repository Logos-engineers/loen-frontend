/**
 * OBS 모아보기 화면
 * - 뒤로가기 bar (H:46, 최상단)
 * - 검색: 제목 + 초성 검색
 * - 필터: 최신순 / 오래된순 / 스크랩(Tagstar.svg)
 * - 달력 아이콘 → DateTimePicker
 * - 배경: #F2F4F7 (background/fill/elevated)
 */
import { ObsCard } from '@/components/obs/obs-card';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { formatKoreanDate, formatWeekLabel, useObsContents, type ObsContent } from '@/hooks/useObs';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Modal,
    PanResponder,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── SVG 아이콘 ────────────────────────────────────────────────────────────────
const SEARCH_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.978 14.4721H15.188L14.908 14.2021C15.533 13.4761 15.9897 12.6209 16.2456 11.6978C16.5014 10.7746 16.5501 9.8063 16.388 8.86214C15.918 6.08214 13.598 3.86214 10.798 3.52214C9.81362 3.39761 8.81379 3.49991 7.87503 3.82123C6.93626 4.14255 6.08345 4.67436 5.38183 5.37597C4.68022 6.07759 4.14841 6.9304 3.82709 7.86917C3.50577 8.80793 3.40347 9.80776 3.528 10.7921C3.868 13.5921 6.088 15.9121 8.868 16.3821C9.81216 16.5442 10.7805 16.4956 11.7036 16.2397C12.6268 15.9838 13.482 15.5271 14.208 14.9021L14.478 15.1821V15.9721L18.728 20.2221C19.138 20.6321 19.808 20.6321 20.218 20.2221C20.628 19.8121 20.628 19.1421 20.218 18.7321L15.978 14.4721ZM9.978 14.4721C7.488 14.4721 5.478 12.4621 5.478 9.97214C5.478 7.48214 7.488 5.47214 9.978 5.47214C12.468 5.47214 14.478 7.48214 14.478 9.97214C14.478 12.4621 12.468 14.4721 9.978 14.4721Z" fill="#0D1C2D" fill-opacity="0.5"/></svg>`;

const CALENDAR_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 3V1H18V3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V9H21V8H3V5C3 3.89 3.89 3 5 3H6V1H8V3H16ZM17 12.5C17 12.2239 16.7761 12 16.5 12H12.5C12.2239 12 12 12.2239 12 12.5V16.5C12 16.7761 12.2239 17 12.5 17H16.5C16.7761 17 17 16.7761 17 16.5V12.5Z" fill="#0D1C2D" fill-opacity="0.5"/></svg>`;

const CALENDAR_LEFT_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9393 3.93934C12.5251 3.35355 13.4746 3.35355 14.0604 3.93934C14.6462 4.52513 14.6462 5.47465 14.0604 6.06043L8.12098 11.9999L14.0604 17.9393C14.6462 18.5251 14.6462 19.4746 14.0604 20.0604C13.4746 20.6462 12.5251 20.6462 11.9393 20.0604L4.93934 13.0604C4.35355 12.4746 4.35355 11.5251 4.93934 10.9393L11.9393 3.93934Z" fill="#0D1C2D" fill-opacity="0.5"/></svg>`;
const ARROW_BACK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9393 3.93934C12.5251 3.35355 13.4746 3.35355 14.0604 3.93934C14.6462 4.52513 14.6462 5.47465 14.0604 6.06043L8.12098 11.9999L14.0604 17.9393C14.6462 18.5251 14.6462 19.4746 14.0604 20.0604C13.4746 20.6462 12.5251 20.6462 11.9393 20.0604L4.93934 13.0604C4.35355 12.4746 4.35355 11.5251 4.93934 10.9393L11.9393 3.93934Z" fill="#0D1C2D" fill-opacity="0.16"/></svg>`;
const CALENDAR_RIGHT_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.93934 3.93934C10.5251 3.35355 11.4746 3.35355 12.0604 3.93934L19.0604 10.9393C19.6462 11.5251 19.6462 12.4746 19.0604 13.0604L12.0604 20.0604C11.4746 20.6462 10.5251 20.6462 9.93934 20.0604C9.35355 19.4746 9.35355 18.5251 9.93934 17.9393L15.8788 11.9999L9.93934 6.06043C9.35355 5.47465 9.35355 4.52513 9.93934 3.93934Z" fill="#0D1C2D" fill-opacity="0.5"/></svg>`;

const TAGSTAR_SVG = `<svg width="67" height="29" viewBox="0 0 67 29" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="67" height="29" rx="8" fill="#0D1C2D" fill-opacity="0.08"/><path d="M14 17.1531L16.1824 18.473C16.5821 18.7149 17.0712 18.3573 16.966 17.9051L16.3875 15.4229L18.3175 13.7506C18.6699 13.4455 18.4806 12.8671 18.0178 12.8303L15.4777 12.6146L14.4838 10.2692C14.305 9.84321 13.695 9.84321 13.5162 10.2692L12.5223 12.6094L9.98222 12.825C9.51944 12.8618 9.33012 13.4403 9.68246 13.7453L11.6125 15.4176L11.034 17.8998C10.9288 18.3521 11.4179 18.7097 11.8176 18.4678L14 17.1531Z" fill="#0D1C2D" fill-opacity="0.5"/><path d="M29.1455 9.55273C29.1455 11.46 31.0117 13.3809 33.6025 13.832L32.9189 15.1035C30.8477 14.6729 29.1523 13.415 28.3457 11.7539C27.5322 13.4014 25.8369 14.666 23.7725 15.1035L23.1025 13.832C25.6523 13.3672 27.5254 11.4531 27.5322 9.55273V8.63672H29.1455V9.55273ZM22.7607 18.6445V17.3867H34.0537V18.6445H22.7607ZM44.8818 9.00586V10.4824C44.8818 12.2803 44.8818 13.9756 44.335 16.5938L42.8174 16.457C43.0703 15.377 43.207 14.4268 43.2891 13.5518L36.0088 13.9277L35.8037 12.6973L43.3574 12.4102C43.3848 11.7471 43.3916 11.1113 43.3916 10.4824V10.2363H36.1729V9.00586H44.8818ZM34.8604 18.6445V17.4004H46.126V18.6445H34.8604ZM57.5283 7.87109V14.7207H56.0791V11.8906H54.7939V14.625H53.3721V8.07617H54.7939V10.6875H56.0791V7.87109H57.5283ZM47.4658 9.74414V8.54102H52.1689V11.9316H48.9561V13.1279C50.3984 13.1074 51.4854 13.0527 52.7432 12.8066L52.8799 14.0234C51.3896 14.2969 50.1387 14.3447 48.3271 14.3516H47.4795V10.8105H50.7061V9.74414H47.4658ZM49.1885 20.0664V15.2539H50.6924V16.416H56.0244V15.2539H57.5283V20.0664H49.1885ZM50.6924 18.8359H56.0244V17.6055H50.6924V18.8359Z" fill="#0D1C2D" fill-opacity="0.5"/></svg>`;

const TAGSTAR_ACTIVE_SVG = `<svg width="67" height="29" viewBox="0 0 67 29" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="67" height="29" rx="8" fill="#6561FF"/><path d="M14 17.1531L16.1824 18.473C16.5821 18.7149 17.0712 18.3573 16.966 17.9051L16.3875 15.4229L18.3175 13.7506C18.6699 13.4455 18.4806 12.8671 18.0178 12.8303L15.4777 12.6146L14.4838 10.2692C14.305 9.84321 13.695 9.84321 13.5162 10.2692L12.5223 12.6094L9.98222 12.825C9.51944 12.8618 9.33012 13.4403 9.68246 13.7453L11.6125 15.4176L11.034 17.8998C10.9288 18.3521 11.4179 18.7097 11.8176 18.4678L14 17.1531Z" fill="white"/><path d="M29.1455 9.55273C29.1455 11.46 31.0117 13.3809 33.6025 13.832L32.9189 15.1035C30.8477 14.6729 29.1523 13.415 28.3457 11.7539C27.5322 13.4014 25.8369 14.666 23.7725 15.1035L23.1025 13.832C25.6523 13.3672 27.5254 11.4531 27.5322 9.55273V8.63672H29.1455V9.55273ZM22.7607 18.6445V17.3867H34.0537V18.6445H22.7607ZM44.8818 9.00586V10.4824C44.8818 12.2803 44.8818 13.9756 44.335 16.5938L42.8174 16.457C43.0703 15.377 43.207 14.4268 43.2891 13.5518L36.0088 13.9277L35.8037 12.6973L43.3574 12.4102C43.3848 11.7471 43.3916 11.1113 43.3916 10.4824V10.2363H36.1729V9.00586H44.8818ZM34.8604 18.6445V17.4004H46.126V18.6445H34.8604ZM57.5283 7.87109V14.7207H56.0791V11.8906H54.7939V14.625H53.3721V8.07617H54.7939V10.6875H56.0791V7.87109H57.5283ZM47.4658 9.74414V8.54102H52.1689V11.9316H48.9561V13.1279C50.3984 13.1074 51.4854 13.0527 52.7432 12.8066L52.8799 14.0234C51.3896 14.2969 50.1387 14.3447 48.3271 14.3516H47.4795V10.8105H50.7061V9.74414H47.4658ZM49.1885 20.0664V15.2539H50.6924V16.416H56.0244V15.2539H57.5283V20.0664H49.1885ZM50.6924 18.8359H56.0244V17.6055H50.6924V18.8359Z" fill="white"/></svg>`;

// ─── 한글 초성 추출 ────────────────────────────────────────────────────────────
const CHOSEONG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function extractChoseong(str: string): string {
  return str
    .split('')
    .map(ch => {
      const code = ch.charCodeAt(0);
      if (code >= 0xAC00 && code <= 0xD7A3) {
        return CHOSEONG[Math.floor((code - 0xAC00) / (21 * 28))];
      }
      return ch;
    })
    .join('');
}

// 초성만 있는 문자열인지 판별
function isChoseongOnly(str: string): boolean {
  return /^[ㄱ-ㅎ]+$/.test(str);
}

type FilterType = 'latest' | 'oldest' | 'scrap';

// ─── 메인 화면 ─────────────────────────────────────────────────────────────────
export default function ObsScreen() {
  const router = useRouter();
  const [searchText, setSearchText]         = useState('');
  const [activeFilter, setActiveFilter]     = useState<FilterType>('latest');
  const [showPicker, setShowPicker]         = useState(false);
  const [selectedDate, setSelectedDate]     = useState<Date | null>(null);

  const { contents, isLoading, error, refetch } = useObsContents();
  useRefetchOnFocus(refetch);

  // ── 정렬 + 검색 + 날짜 필터 ──────────────────────────────────────────────────
  const filteredList = useMemo(() => {
    let list = [...contents];

    // 1) 스크랩 필터
    if (activeFilter === 'scrap') {
      list = list.filter(item => item.isScraped);
    }

    // 2) 정렬 (최신순 / 오래된순)
    if (activeFilter === 'oldest') {
      list.sort((a, b) => a.publishedDate.localeCompare(b.publishedDate));
    } else {
      list.sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
    }

    // 3) 날짜 필터 (달력에서 날짜 선택 시)
    if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      const target = `${y}-${m}-${d}`;
      list = list.filter(item => item.publishedDate === target);
    }

    // 4) 텍스트 검색
    if (searchText.trim()) {
      const q = searchText.trim();
      if (isChoseongOnly(q)) {
        list = list.filter(item => extractChoseong(item.title).includes(q));
      } else {
        list = list.filter(item => item.title.toLowerCase().includes(q.toLowerCase()));
      }
    }

    return list;
  }, [searchText, activeFilter, selectedDate, contents]);

  // ── 커스텀 달력 상태 ────────────────────────────────────────────────────────
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const goPrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowPicker(false);
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0(일) ~ 6(토)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    
    // 이전 달 꼬리
    for (let i = 0; i < firstDay; i++) {
        days.unshift({
            date: new Date(year, month - 1, daysInPrevMonth - i),
            isCurrentMonth: false,
        });
    }
    
    // 이번 달 활성 날짜
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({
            date: new Date(year, month, i),
            isCurrentMonth: true,
        });
    }
    
    // 다음 달 머리 (총 42칸 맞추기)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({
            date: new Date(year, month + 1, i),
            isCurrentMonth: false,
        });
    }
    
    return days;
  };

  const panY = useRef(new Animated.Value(0)).current;

  // 모달이 열릴 때 panY 초기화
  useEffect(() => {
    if (showPicker) {
      panY.setValue(0);
    }
  }, [showPicker]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // Drag down greater than 5px to claim responder
          return gestureState.dy > 5;
        },
        onPanResponderMove: Animated.event([null, { dy: panY }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 150 || gestureState.vy > 1.5) {
            Animated.timing(panY, {
              toValue: SCREEN_HEIGHT,
              duration: 200,
              useNativeDriver: false,
            }).start(() => setShowPicker(false));
          } else {
            Animated.spring(panY, {
              toValue: 0,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [panY]
  );

  const clearDate = () => setSelectedDate(null);

  const renderItem = useCallback(({ item }: { item: ObsContent }) => (
    <ObsCard
      item={item}
      noShadow
      enableScrap
      onScrapChange={refetch}
      onPressView={() => router.push({
        pathname: '/obs/content/intro',
        params: {
          contentId: String(item.id),
          title: item.title,
          verse: item.biblePassage,
          weekLabel: formatWeekLabel(item.publishedDate),
        },
      })}
      onPressReview={() => router.push({
        pathname: '/obs/quiz/intro',
        params: {
          contentId: String(item.id),
          title: item.title,
          verse: item.biblePassage,
          date: formatKoreanDate(item.publishedDate),
        },
      })}
    />
  ), [router, refetch]);

  return (
    // 최상단부터 시작 — SafeAreaView로 복구하여 상태바(9:41, 배터리) 아래로 내림
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.backBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <SvgXml xml={ARROW_BACK_SVG} width={24} height={24} />
        </TouchableOpacity>
        {/* 날짜 선택 중이면 초기화 버튼 표시 */}
        {selectedDate && (
          <TouchableOpacity style={styles.clearDateBtn} onPress={clearDate}>
            <Text style={styles.clearDateText}>날짜 초기화</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── 스크롤 콘텐츠 ── */}
      {isLoading && <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />}
      {error && !isLoading && (
        <Text style={{ textAlign: 'center', color: colors.text.secondary, padding: spacing.xl, flex: 1 }}>{error}</Text>
      )}
      {!isLoading && !error && (
      <FlatList
        data={filteredList}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
          </View>
        }
        ListHeaderComponent={
          <>
            {/* 검색 바 */}
            <View style={styles.searchBarWrapper}>
              <View style={styles.searchInput}>
                <SvgXml xml={SEARCH_SVG} width={24} height={24} />
                <TextInput
                  style={styles.searchTextInput}
                  placeholder="검색어를 입력해주세요"
                  placeholderTextColor="rgba(13,28,45,0.5)"
                  value={searchText}
                  onChangeText={setSearchText}
                  returnKeyType="search"
                />
                {/* calendar.svg 아이콘 — 탭 시 DateTimePicker 표시 */}
                <TouchableOpacity onPress={() => setShowPicker(true)} hitSlop={8}>
                  <SvgXml xml={CALENDAR_SVG} width={24} height={24} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 필터 chips */}
            <View style={styles.filterRow}>
              <View style={styles.filterLeft}>
                {/* 최신순 */}
                <TouchableOpacity
                  style={[styles.filterChip, { backgroundColor: activeFilter === 'latest' ? colors.primary : colors.border }]}
                  onPress={() => setActiveFilter('latest')}
                >
                  <Text style={[styles.filterChipText, { color: activeFilter === 'latest' ? '#FFFFFF' : 'rgba(13,28,45,0.5)' }]}>
                    최신 순
                  </Text>
                </TouchableOpacity>
                {/* 오래된순 */}
                <TouchableOpacity
                  style={[styles.filterChip, { backgroundColor: activeFilter === 'oldest' ? colors.primary : colors.border }]}
                  onPress={() => setActiveFilter('oldest')}
                >
                  <Text style={[styles.filterChipText, { color: activeFilter === 'oldest' ? '#FFFFFF' : 'rgba(13,28,45,0.5)' }]}>
                    오래된 순
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Tagstar — 완성 칩 SVG */}
              <TouchableOpacity onPress={() => setActiveFilter(activeFilter === 'scrap' ? 'latest' : 'scrap')}>
                <SvgXml xml={activeFilter === 'scrap' ? TAGSTAR_ACTIVE_SVG : TAGSTAR_SVG} width={67} height={29} />
              </TouchableOpacity>
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
      />
      )}

      {/* ── Custom Calendar Modal ── */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowPicker(false)} 
          />
          <Animated.View 
            style={[
              styles.calendarContainer, 
              { transform: [{ translateY: panY }] }
            ]} 
            {...panResponder.panHandlers}
          >
              <View style={styles.calendarHandleWrapper}>
                <View style={styles.calendarHandle} />
            </View>
          
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarMonthText}>
                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
              </Text>
              <View style={styles.calendarNav}>
                <TouchableOpacity onPress={goPrevMonth} hitSlop={8}>
                  <SvgXml xml={CALENDAR_LEFT_SVG} width={24} height={24} />
                </TouchableOpacity>
                <TouchableOpacity onPress={goNextMonth} hitSlop={8}>
                  <SvgXml xml={CALENDAR_RIGHT_SVG} width={24} height={24} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.weekDaysRow}>
              {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                <View key={day} style={styles.weekDayCell}>
                  <Text style={[styles.weekDayText, idx === 0 && styles.weekDaySunday]}>{day}</Text>
                </View>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {generateCalendarDays().map((item, index) => {
                const isSelected = selectedDate && 
                  selectedDate.getFullYear() === item.date.getFullYear() &&
                  selectedDate.getMonth() === item.date.getMonth() &&
                  selectedDate.getDate() === item.date.getDate();
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.dayCellWrapper}
                    onPress={() => handleDateSelect(item.date)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.dayCell, isSelected && styles.dayCellSelected]}>
                      <Text style={[
                        styles.dayText,
                        index % 7 === 0 && styles.weekDaySunday,
                        !item.isCurrentMonth && { opacity: 0.4 },
                        isSelected && { color: '#FFFFFF' }
                      ]}>
                        {item.date.getDate()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── 스타일 ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base, // #F2F4F7 = background/fill/elevated
  },

  // 뒤로가기 bar: W393 H46, 화면 최상단
  backBar: {
    width: '100%',
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    backgroundColor: colors.background.base,
  },
  backBtn: {
    width: 100,
    paddingLeft: 16,
    paddingRight: 8,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    flexShrink: 0,
  },
  clearDateBtn: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: spacing.sm,
  },
  clearDateText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },

  // 검색
  searchBarWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchTextInput: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    padding: 0,
    margin: 0,
  },

  // 필터 행
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterLeft: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  filterChipText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: 21,
  },


  // 빈 화면
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },

  listContent: {
    paddingBottom: 32,
  },

  // ── 커스텀 캘린더 모달 ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13,28,45,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  calendarContainer: {
    width: 361,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    marginBottom: Platform.OS === 'ios' ? 0 : 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  calendarHandleWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarHandle: {
    width: 80,
    height: 5,
    backgroundColor: 'rgba(13,28,45,0.08)',
    borderRadius: 10.48,
  },
  calendarHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  calendarMonthText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(13,28,45,0.5)',
    lineHeight: 25.6,
  },
  calendarNav: {
    flexDirection: 'row',
    gap: 10,
  },
  weekDaysRow: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  weekDayCell: {
    width: '14.285%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(13,28,45,0.8)',
    lineHeight: 25.6,
  },
  weekDaySunday: {
    color: '#FF5358', // 주일(일요일) 강조 — 브랜드 red
  },
  daysGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dayCellWrapper: {
    width: '14.285%', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayCell: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 13.1,
    fontWeight: '600',
    color: 'rgba(13,28,45,0.8)',
    lineHeight: 18.3,
  },
});
