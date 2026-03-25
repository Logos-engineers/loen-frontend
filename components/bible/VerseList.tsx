/**
 * VerseList.tsx
 * FlatList of bible verses with optional section headers (주제명).
 * Figma: section header pt 16 pb 8 px 16, Bold 16px, rgba(13,28,45,0.5)
 */
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/tokens';
import { VerseItem } from './VerseItem';

export type VerseListItem =
  | { type: 'section'; title: string }
  | { type: 'verse'; verseNum: number; text: string };

type VerseListProps = {
  items: VerseListItem[];
  highlightVerseNum: number | null;
  listFooter?: React.ReactNode;
};

export type VerseListHandle = {
  scrollToVerse: (verseNum: number) => void;
};

const VerseList = forwardRef<VerseListHandle, VerseListProps>(
  ({ items, highlightVerseNum, listFooter }, ref) => {
    const listRef = useRef<FlatList>(null);
    const insets = useSafeAreaInsets();
    const paddingTop = insets.top + 68;

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
        onScrollToIndexFailed={() => {
          // Graceful fallback: scroll to end
          listRef.current?.scrollToEnd({ animated: true });
        }}
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
