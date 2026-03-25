/**
 * VerseItem.tsx
 * Single bible verse row.
 * Figma: badge (32×32 #f2f4f7 radius-8) on the left + body text on the right.
 * Accepts optional isHighlighted prop for search-entry animation.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/tokens';

type VerseItemProps = {
  verseNum: number;
  text: string;
  isHighlighted?: boolean;
};

export function VerseItem({ verseNum, text, isHighlighted = false }: VerseItemProps) {
  const highlightOpacity = useRef(new Animated.Value(0)).current;
  const highlightScale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    if (!isHighlighted) {
      highlightOpacity.setValue(0);
      highlightScale.setValue(0.98);
      return;
    }
    Animated.sequence([
      Animated.parallel([
        Animated.timing(highlightOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(highlightScale, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]),
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(highlightOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(highlightScale, { toValue: 1.01, duration: 220, useNativeDriver: true }),
      ]),
    ]).start();
  }, [highlightOpacity, highlightScale, isHighlighted]);

  return (
    <View style={styles.row}>
      {isHighlighted ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.highlightBlur,
            {
              opacity: highlightOpacity,
              transform: [{ scale: highlightScale }],
            },
          ]}
        />
      ) : null}

      <View style={styles.countCol}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{verseNum}</Text>
        </View>
      </View>

      <View style={styles.textCol}>
        {isHighlighted && (
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.highlightBg, { opacity: highlightOpacity }]}
            pointerEvents="none"
          />
        )}
        <Text style={styles.verseText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    width: '100%',
    position: 'relative',
  },
  highlightBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 2,
    bottom: 2,
    backgroundColor: 'rgba(101,97,255,0)',
  },
  countCol: {
    width: 48,
    paddingLeft: 16,
    paddingTop: 12,
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  badge: {
    width: 32,
    height: 32,
    backgroundColor: colors.background.base,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    lineHeight: 16 * 1.6,
    color: colors.text.primary,
    textAlign: 'center',
  },
  textCol: {
    flex: 1,
    paddingRight: 16,
    paddingVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  highlightBg: {
    backgroundColor: 'rgba(101,97,255,0.2)',
    borderRadius: 16,
  },
  verseText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    lineHeight: 16 * 1.6,
    color: colors.text.primary,
    textAlign: 'justify',
  },
});
