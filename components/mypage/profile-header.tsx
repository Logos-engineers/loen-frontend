import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileHeaderProps {
  nickname?: string | null;
  name?: string | null;
  oikosName?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  onEditPress: () => void;
}

export function ProfileHeader({
  nickname,
  name,
  oikosName,
  bio,
  profileImage,
  onEditPress,
}: ProfileHeaderProps) {
  const displayName = nickname?.trim() || name?.trim() || '이름 없음';
  const initial = displayName[0] ?? '?';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
          {nickname?.trim() && name?.trim() && nickname.trim() !== name.trim() ? (
            <Text style={styles.realName} numberOfLines={1}>{name.trim()}</Text>
          ) : null}
          {oikosName ? (
            <View style={styles.oikosRow}>
              <Ionicons name="people-outline" size={14} color={colors.text.secondary} />
              <Text style={styles.oikos} numberOfLines={1}>{oikosName}</Text>
            </View>
          ) : (
            <Text style={styles.oikosEmpty}>오이코스 미소속</Text>
          )}
        </View>

        <TouchableOpacity style={styles.editButton} onPress={onEditPress} activeOpacity={0.7}>
          <Text style={styles.editButtonText}>프로필 수정</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.bio, !bio && styles.bioEmpty]} numberOfLines={2}>
        {bio?.trim() || '한 줄 소개를 등록해 보세요.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.elevated,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    shadowColor: shadow.color,
    shadowOffset: shadow.card.offset,
    shadowOpacity: shadow.card.opacity,
    shadowRadius: shadow.card.radius,
    elevation: shadow.card.elevation,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    flexShrink: 0,
  },
  avatarFallback: {
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.secondary,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  realName: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: 1,
  },
  oikosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  oikos: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    flexShrink: 1,
  },
  oikosEmpty: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.dim,
  },
  editButton: {
    paddingHorizontal: spacing.smd,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background.base,
    flexShrink: 0,
  },
  editButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  bio: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    lineHeight: 21,
  },
  bioEmpty: {
    color: colors.text.dim,
  },
});
