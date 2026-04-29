import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { BiblePassage, getPendingPassages, setPendingPassages } from '@/utils/faith-note-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── 성경 데이터 ──────────────────────────────────────────────────────────────

const OT_BOOKS = [
  { name: '창세기', eng: 'Genesis', chapters: 50 },
  { name: '출애굽기', eng: 'Exodus', chapters: 40 },
  { name: '레위기', eng: 'Leviticus', chapters: 27 },
  { name: '민수기', eng: 'Numbers', chapters: 36 },
  { name: '신명기', eng: 'Deuteronomy', chapters: 34 },
  { name: '여호수아', eng: 'Joshua', chapters: 24 },
  { name: '사사기', eng: 'Judges', chapters: 21 },
  { name: '룻기', eng: 'Ruth', chapters: 4 },
  { name: '사무엘상', eng: '1 Samuel', chapters: 31 },
  { name: '사무엘하', eng: '2 Samuel', chapters: 24 },
  { name: '열왕기상', eng: '1 Kings', chapters: 22 },
  { name: '열왕기하', eng: '2 Kings', chapters: 25 },
  { name: '시편', eng: 'Psalms', chapters: 150 },
  { name: '잠언', eng: 'Proverbs', chapters: 31 },
  { name: '이사야', eng: 'Isaiah', chapters: 66 },
  { name: '예레미야', eng: 'Jeremiah', chapters: 52 },
  { name: '에스겔', eng: 'Ezekiel', chapters: 48 },
  { name: '다니엘', eng: 'Daniel', chapters: 12 },
];

const NT_BOOKS = [
  { name: '마태복음', eng: 'Matthew', chapters: 28 },
  { name: '마가복음', eng: 'Mark', chapters: 16 },
  { name: '누가복음', eng: 'Luke', chapters: 24 },
  { name: '요한복음', eng: 'John', chapters: 21 },
  { name: '사도행전', eng: 'Acts', chapters: 28 },
  { name: '로마서', eng: 'Romans', chapters: 16 },
  { name: '고린도전서', eng: '1 Corinthians', chapters: 16 },
  { name: '고린도후서', eng: '2 Corinthians', chapters: 13 },
  { name: '갈라디아서', eng: 'Galatians', chapters: 6 },
  { name: '에베소서', eng: 'Ephesians', chapters: 6 },
  { name: '빌립보서', eng: 'Philippians', chapters: 4 },
  { name: '히브리서', eng: 'Hebrews', chapters: 13 },
  { name: '야고보서', eng: 'James', chapters: 5 },
  { name: '요한계시록', eng: 'Revelation', chapters: 22 },
];

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function passageKey(book: string, chapter: number) {
  return `${book}:${chapter}`;
}

// ─── Chapter Grid ─────────────────────────────────────────────────────────────

function ChapterGrid({
  book,
  chapters,
  selected,
  onToggle,
}: {
  book: string;
  chapters: number;
  selected: Set<string>;
  onToggle: (p: BiblePassage) => void;
}) {
  return (
    <View style={g.grid}>
      {Array.from({ length: chapters }, (_, i) => i + 1).map((ch) => {
        const key = passageKey(book, ch);
        const isSelected = selected.has(key);
        return (
          <TouchableOpacity
            key={ch}
            style={[g.cell, isSelected && g.cellSelected]}
            onPress={() => onToggle({ book, chapter: ch })}
            activeOpacity={0.7}
          >
            <Text style={[g.cellText, isSelected && g.cellTextSelected]}>{ch}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const g = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: 6 },
  cell: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  cellSelected: { backgroundColor: colors.primary },
  cellText: { fontSize: fontSize.sm, color: colors.text.secondary },
  cellTextSelected: { color: '#fff', fontWeight: fontWeight.semibold },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

type TabType = 'OT' | 'NT';

export default function SelectBibleScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('OT');
  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set<string>();
    getPendingPassages().forEach((p) => s.add(passageKey(p.book, p.chapter)));
    return s;
  });

  const books = tab === 'OT' ? OT_BOOKS : NT_BOOKS;

  const toggle = (p: BiblePassage) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const key = passageKey(p.book, p.chapter);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleDone = () => {
    const passages: BiblePassage[] = [];
    selected.forEach((key) => {
      const [book, ch] = key.split(':');
      passages.push({ book, chapter: Number(ch) });
    });
    // book 순서 유지 (OT → NT 순)
    const allBooks = [...OT_BOOKS, ...NT_BOOKS].map((b) => b.name);
    passages.sort((a, b) => {
      const ai = allBooks.indexOf(a.book);
      const bi = allBooks.indexOf(b.book);
      if (ai !== bi) return ai - bi;
      return a.chapter - b.chapter;
    });
    setPendingPassages(passages);
    router.back();
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.headerRight}>노트 작성하기</Text>
      </View>

      {/* 탭 */}
      <View style={s.tabRow}>
        {(['OT', 'NT'] as TabType[]).map((t) => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)} activeOpacity={0.7}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'OT' ? '구약성경' : '신약성경'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 책 + 장 목록 */}
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {books.map((book) => (
          <View key={book.name}>
            <View style={s.bookHeader}>
              <Text style={s.bookName}>{book.name}</Text>
              <Text style={s.bookEng}>{book.eng}</Text>
            </View>
            <ChapterGrid book={book.name} chapters={book.chapters} selected={selected} onToggle={toggle} />
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* 완료 버튼 */}
      <View style={s.footer}>
        <TouchableOpacity style={s.doneBtn} onPress={handleDone} activeOpacity={0.8}>
          <Text style={s.doneBtnText}>선택 완료 ({selected.size})</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, backgroundColor: colors.background.elevated },
  headerRight: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text.accent },
  tabRow: { flexDirection: 'row', backgroundColor: colors.background.elevated, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text.secondary },
  tabTextActive: { color: colors.primary, fontWeight: fontWeight.semibold },
  scroll: { flex: 1 },
  bookHeader: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 6 },
  bookName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  bookEng: { fontSize: fontSize.xs, color: colors.text.secondary },
  footer: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.background.elevated, borderTopWidth: 1, borderTopColor: colors.border },
  doneBtn: { height: 52, borderRadius: radius.lg, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  doneBtnText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: '#fff' },
});
