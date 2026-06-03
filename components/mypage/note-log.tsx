import { FaithNoteCard } from '@/components/faith-note/faith-note-card';
import { FaithNoteTabBar, type FaithNoteTab } from '@/components/faith-note/faith-note-tab-bar';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useMyFaithNotes } from '@/hooks/useMyFaithNotes';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NoteLogProps {
  uid: string | null | undefined;
}

/** 마이페이지 최하단 신앙노트 로그 — 본인 작성 노트 최신 5개 + 더보기. */
export function NoteLog({ uid }: NoteLogProps) {
  const [tab, setTab] = useState<FaithNoteTab>('THANKS');
  const { notes, isLoading } = useMyFaithNotes(tab, uid, 5);

  return (
    <View style={styles.container}>
      <SectionHeader title="신앙노트 로그" />

      <FaithNoteTabBar selectedTab={tab} onSelectTab={setTab} />

      <View style={styles.body}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : notes.length === 0 ? (
          <Text style={styles.empty}>작성한 노트가 없어요.</Text>
        ) : (
          <>
            {notes.map((item) => (
              <FaithNoteCard key={item.id} item={item} />
            ))}
            <TouchableOpacity
              style={styles.moreButton}
              activeOpacity={0.7}
              onPress={() => router.push('/faith-note')}
            >
              <Text style={styles.moreButtonText}>더보기</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  body: {
    paddingTop: spacing.md,
  },
  loader: {
    paddingVertical: spacing.xl,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.xl,
    fontSize: fontSize.md,
    color: colors.text.dim,
  },
  moreButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
  },
  moreButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
  },
});
