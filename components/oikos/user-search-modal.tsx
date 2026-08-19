import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { positionLabel, searchUsers, type UserSearchItem } from '@/hooks/useOikosManagement';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSelect: (user: UserSearchItem) => void;
};

// 표시 이름 = "이름(별명)". 둘 중 하나만 있으면 있는 것만, 둘 다 없으면 대체 문구.
function displayName(u: UserSearchItem): string {
  const name = u.name?.trim();
  const nick = u.nickname?.trim();
  if (name && nick) return `${name}(${nick})`;
  return name || nick || '이름 없음';
}

/** 이름 또는 별명으로 사용자를 검색해 한 명 선택하는 모달. 리더/S리더/부원 지정에 공통 사용. */
export function UserSearchModal({ visible, title, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 모달 열릴 때 상태 초기화
  useEffect(() => {
    if (visible) {
      setQuery('');
      setResults([]);
      setIsSearching(false);
    }
  }, [visible]);

  // 디바운스 검색
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const list = await searchUsers(q);
        setResults(list);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={26} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.text.secondary} />
          <TextInput
            style={styles.input}
            placeholder="이름 또는 별명으로 검색"
            placeholderTextColor={colors.text.dim}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.text.dim} />
            </TouchableOpacity>
          ) : null}
        </View>

        {isSearching ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(u) => u.uid}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.7}
                onPress={() => onSelect(item)}
              >
                <View style={styles.avatar}>
                  <Ionicons name="person" size={18} color={colors.text.secondary} />
                </View>
                <Text style={styles.name}>{displayName(item)}</Text>
                <Text style={styles.position}>{positionLabel(item.position)}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              query.trim().length > 0 ? (
                <Text style={styles.empty}>검색 결과가 없어요.</Text>
              ) : (
                <Text style={styles.empty}>이름 또는 별명을 입력해 검색하세요.</Text>
              )
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    height: 44,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
  },
  input: { flex: 1, fontSize: fontSize.base, color: colors.text.primary, paddingVertical: 0 },
  listContent: { paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { flex: 1, fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
  position: { fontSize: fontSize.sm, color: colors.text.secondary },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 64 },
  empty: { textAlign: 'center', marginTop: spacing.xxl, fontSize: fontSize.md, color: colors.text.dim },
});
