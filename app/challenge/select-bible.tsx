import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const BIBLE_BOOKS = [
  '창세기', '출애굽기', '레위기', '민수기', '신명기', '여호수아', '사사기', '룻기', '사무엘상', '사무엘하',
  '열왕기상', '열왕기하', '역대상', '역대하', '에스라', '느헤미야', '에스더', '욥기', '시편', '잠언',
  '전도서', '아가', '이사야', '예레미야', '예레미야애가', '에스겔', '다니엘', '호세아', '요엘', '아모스',
  '오바댜', '요나', '미가', '나훔', '하박국', '스바냐', '학개', '스가랴', '말라기',
  '마태복음', '마가복음', '누가복음', '요한복음', '사도행전', '로마서', '고린도전서', '고린도후서', '갈라디아서', '에베소서',
  '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서', '디모데전서', '디모데후서', '디도서', '빌레몬서', '히브리서', '야고보서',
  '베드로전서', '베드로후서', '요한일서', '요한이서', '요한삼서', '유다서', '요한계시록'
];

function formatSelectedBooks(selected: string[]) {
  if (selected.length === 0) return '';
  if (selected.length === 1) return selected[0];
  if (selected.length === 2) return `${selected[0]}, ${selected[1]}`;
  return `${selected[0]}, ${selected[1]} 외 ${selected.length - 2}권`;
}

export default function ChallengeSelectBibleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name: string }>();
  const challengeName = params.name || '';
  const insets = useSafeAreaInsets();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  // 취소 시 원복을 위한 임시 선택 상태
  const [tempSelectedBooks, setTempSelectedBooks] = useState<string[]>([]);

  const formattedBooks = formatSelectedBooks(selectedBooks);

  const handleBack = () => {
    router.back();
  };

  const openSheet = () => {
    setTempSelectedBooks([...selectedBooks]);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
  };

  const toggleBook = (book: string) => {
    setTempSelectedBooks((prev) => {
      if (prev.includes(book)) {
        return prev.filter((b) => b !== book);
      }
      return [...prev, book];
    });
  };

  const handleCompleteSelection = () => {
    if (tempSelectedBooks.length === 0) return;
    const sorted = [...tempSelectedBooks].sort((a, b) => {
      return BIBLE_BOOKS.indexOf(a) - BIBLE_BOOKS.indexOf(b);
    });
    setSelectedBooks(sorted);
    closeSheet();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>성경 챌린지 만들기</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <View style={styles.content}>
        {/* 하나의 카드 안에 두 영역 배치 */}
        <View style={styles.card}>
          
          {/* 영역 1: 어디를 읽을까요? */}
          <View style={styles.section}>
            <Text style={styles.label}>어디를 읽을까요?</Text>
            <TouchableOpacity
              style={styles.inputBorder}
              activeOpacity={0.7}
              onPress={openSheet}
            >
              <Text style={[styles.inputText, selectedBooks.length === 0 && styles.inputTextPlaceholder]}>
                {selectedBooks.length > 0 ? formattedBooks : '성경을 선택해주세요'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* 영역 2: 챌린지 이름을 정해주세요 */}
          <View style={styles.sectionLast}>
            <Text style={styles.label}>챌린지 이름을 정해주세요</Text>
            <View style={styles.inputBorder}>
              <Text style={styles.inputText}>{challengeName}</Text>
            </View>
          </View>

        </View>
      </View>

      {/* 성경 선택 바텀시트 모달 */}
      <Modal visible={isSheetOpen} transparent animationType="slide" onRequestClose={closeSheet}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeSheet}>
            <View style={styles.modalBackground} />
          </TouchableWithoutFeedback>

          <View style={styles.bottomSheet}>
            {/* 드래그 핸들 */}
            <View style={styles.sheetHandleWrapper}>
              <View style={styles.sheetHandle} />
            </View>

            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              {BIBLE_BOOKS.map((book) => {
                const isSelected = tempSelectedBooks.includes(book);
                return (
                  <TouchableOpacity
                    key={book}
                    style={styles.bookRow}
                    activeOpacity={0.7}
                    onPress={() => toggleBook(book)}
                  >
                    <Text style={[styles.bookText, isSelected && styles.bookTextSelected]}>
                      {book}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-outline" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 하단 완료 버튼 */}
            <View style={[styles.sheetFooter, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
              <TouchableOpacity
                style={[styles.completeBtn, tempSelectedBooks.length === 0 && styles.completeBtnDisabled]}
                disabled={tempSelectedBooks.length === 0}
                activeOpacity={0.8}
                onPress={handleCompleteSelection}
              >
                <Text style={styles.completeBtnText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  
  // 헤더
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.base,
  },
  backButton: {
    width: 32,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  headerRightSpace: {
    width: 32,
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },

  // 단일 카드
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionLast: {
    marginBottom: 0,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  inputBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  inputText: {
    fontSize: fontSize.lg,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  inputTextPlaceholder: {
    color: colors.text.secondary, // placeholder 색상
  },

  // 모달 바텀시트
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay.default,
  },
  bottomSheet: {
    backgroundColor: colors.background.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '80%',
    paddingTop: 12,
  },
  sheetHandleWrapper: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  sheetHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  sheetScroll: {
    paddingHorizontal: spacing.xl,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  bookText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  bookTextSelected: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  sheetFooter: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  completeBtn: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtnDisabled: {
    backgroundColor: 'rgba(101,97,255,0.3)', // 비활성 시 연한 보라색 배경
  },
  completeBtnText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
