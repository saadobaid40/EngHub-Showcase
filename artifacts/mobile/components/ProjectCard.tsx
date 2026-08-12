import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Project } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const colors = useColors();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={onPress}
    >
      {project.imageUrl ? (
        <Image
          source={{ uri: project.imageUrl }}
          style={[styles.image, { borderRadius: colors.radius - 2 }]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.imagePlaceholder,
            {
              backgroundColor: colors.muted,
              borderRadius: colors.radius - 2,
            },
          ]}
        >
          <Feather name="cpu" size={28} color={colors.primary} />
        </View>
      )}

      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {project.title}
        </Text>

        {project.courseName ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.primary + '22', borderRadius: 6 },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {project.courseName}
            </Text>
          </View>
        ) : null}

        <Text
          style={[styles.description, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          {project.description}
        </Text>

        <View style={styles.footer}>
          {project.authorUsername ? (
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {project.authorUsername}
            </Text>
          ) : null}

          <View style={styles.upvotes}>
            <Feather name="chevrons-up" size={14} color={colors.primary} />
            <Text style={[styles.upvoteCount, { color: colors.primary }]}>
              {project.upvotes}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 14,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 22,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
  },
  upvotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  upvoteCount: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
