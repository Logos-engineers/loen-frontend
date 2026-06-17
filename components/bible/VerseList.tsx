/**
 * VerseList.tsx
 * FlatList of bible verses with optional section headers (주제명).
 * Figma: section header pt 16 pb 8 px 16, Bold 16px, rgba(13,28,45,0.5)
 */
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/tokens';
import { HEADER_TOP_GAP } from './BibleHeader';
import { VerseItem } from './VerseItem';

export type VerseListItem =
  | { type: 'section'; title: string }
  | { type: 'verse'; verseNum: number; text: string };

type VerseListProps = {
  items: VerseListItem[];
  highlightVerseNum: number | null;
  listFooter?: React.ReactNode;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export type VerseListHandle = {
  scrollToVerse: (verseNum: number) => void;
};

const VerseList = forwardRef<VerseListHandle, VerseListProps>(
  ({ items, highlightVerseNum, listFooter, onScroll }, ref) => {
    const listRef = useRef<FlatList>(null);
    const insets = useSafeAreaInsets();
    // 절대위치 헤더(BibleHeader) 높이만큼 본문을 내려 가림 방지. 헤더 상단 간격(HEADER_TOP_GAP)도 포함.
    const paddingTop = insets.top + 68 + HEADER_TOP_GAP;

    useImperativeHandle(ref, () => ({
      scrollToVerse: (verseNum: number) => {
        const index = items.findIndex(
          (item) => item.type === 'verse' && item.verseNum === verseNum
        );
        if (index >= 0) {
          listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
        }
      },
    }));

    const renderItem = ({ item }: { item: VerseListItem }) => {
      if (item.type === 'section') {
        return (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionText}>{item.title}</Text>
          </View>
        );
      }
      return (
        <VerseItem
          verseNum={item.verseNum}
          text={item.text}
          isHighlighted={highlightVerseNum === item.verseNum}
        />
      );
    };

    return (
      <FlatList
        ref={listRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.type === 'section' ? `section-${index}` : `verse-${item.verseNum}`
        }
        contentContainerStyle={[styles.container, { paddingTop }]}
        onScrollToIndexFailed={(info) => {
          // 갓 마운트되어 아직 레이아웃되지 않은 경우(예: 검색으로 진입) — 잠시 후 해당 절로 재시도.
          // (맨 끝으로 보내면 하이라이트한 절이 화면 밖에 떠버림)
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
              viewPosition: 0.3,
            });
          }, 120);
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={listFooter ? () => <>{listFooter}</> : undefined}
      />
    );
  }
);

VerseList.displayName = 'VerseList';
export { VerseList };

const styles = StyleSheet.create({
  container: {
    paddingBottom: 136, // space for floating arrow buttons
  },
  sectionHeader: {
    // Figma: pt 16 pb 8 px 16
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  sectionText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    lineHeight: 16 * 1.6,
    color: colors.text.secondary,
    textAlign: 'justify',
  },
});
