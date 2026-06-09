/**
 * SearchResultItem.tsx
 * Single search result row: book + "N장 N절" + text with keyword highlighted.
 * Figma: result row SemiBold 14px label + Medium 16px text, keyword in primary color.
 */
import { colors, radius, spacing, fontSize } from '@/constants/tokens';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type SearchResult = {
  bookCode: string;
  bookName: string;
  chapterNum: number;
  verseNum: number;
  text: string;
  query: string;          // for keyword highlight
};

type SearchResultItemProps = {
  result: SearchResult;
  onPress: (result: SearchResult) => void;
  showBookName?: boolean;
};

export function SearchResultItem({ result, onPress, showBookName = true }: SearchResultItemProps) {
  const { bookName, chapterNum, verseNum, text, query } = result;

  const renderHighlightedText = () => {
    if (!query) return <Text style={styles.verseText}>{text}</Text>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx < 0) return <Text style={styles.verseText}>{text}</Text>;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);
    return (
      <Text style={styles.verseText}>
        {before}
        <Text style={styles.verseTextHighlight}>{match}</Text>
        {after}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(result)}
      activeOpacity={0.85}
    >
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {showBookName ? `${bookName} ${chapterNum}:${verseNum}` : `${chapterNum}:${verseNum}`}
        </Text>
      </View>
      {renderHighlightedText()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.base,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Pretendard-Medium',
    fontSize: fontSize.sm,
    lineHeight: 18,
    color: colors.text.secondary,
  },
  verseText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: fontSize.base,
    lineHeight: 24,
    color: colors.text.primary,
  },
  verseTextHighlight: {
    fontFamily: 'Pretendard-SemiBold',
    color: colors.primary,
  },
});
