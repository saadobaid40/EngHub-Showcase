import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import {
  useGetProject,
  useUpvoteProject,
  useListComments,
  useCreateComment,
} from '@workspace/api-client-react';
import type { Comment } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

function MetaBadge({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.metaBadge, { backgroundColor: colors.muted, borderRadius: 8 }]}>
      <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

function CommentItem({ comment, onDelete, isOwner }: { comment: Comment; onDelete: (id: number) => void; isOwner: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.commentItem, { borderBottomColor: colors.border }]}>
      <View style={styles.commentHeader}>
        <View style={[styles.commentAvatar, { backgroundColor: colors.muted }]}>
          <Feather name="user" size={12} color={colors.mutedForeground} />
        </View>
        <Text style={[styles.commentAuthor, { color: colors.foreground }]}>
          {comment.authorUsername ?? 'Anonymous'}
        </Text>
        <Text style={[styles.commentDate, { color: colors.mutedForeground }]}>
          {new Date(comment.createdAt).toLocaleDateString()}
        </Text>
        {isOwner ? (
          <Pressable onPress={() => onDelete(comment.id)} hitSlop={8}>
            <Feather name="trash-2" size={14} color={colors.destructive} />
          </Pressable>
        ) : null}
      </View>
      <Text style={[styles.commentText, { color: colors.foreground }]}>{comment.text}</Text>
    </View>
  );
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = Number(id);
  const colors = useColors();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState('');
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const scale = useSharedValue(1);

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
  } = useGetProject(projectId);

  const { data: comments, isLoading: commentsLoading } = useListComments(projectId);

  const { mutate: upvote, isPending: upvotePending } = useUpvoteProject({
    mutation: {
      onSuccess: (updated) => {
        queryClient.setQueryData([`/api/projects/${projectId}`], updated);
        setHasUpvoted(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
    },
  });

  const { mutate: submitComment, isPending: commentPending } = useCreateComment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/comments`] });
        setCommentText('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleUpvote = () => {
    if (!user) {
      router.push('/(tabs)/account');
      return;
    }
    scale.value = withSpring(1.3, {}, () => {
      scale.value = withSpring(1);
    });
    upvote({ id: projectId });
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    submitComment({ id: projectId, data: { text: commentText.trim() } });
  };

  if (projectLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (projectError || !project) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={36} color={colors.mutedForeground} />
        <Text style={[styles.errorMsg, { color: colors.mutedForeground }]}>Project not found</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted, borderRadius: 8 }]}>
          <Text style={{ color: colors.foreground }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const commentsData = comments ?? [];

  const ListHeader = (
    <View style={{ backgroundColor: colors.background }}>
      {/* Hero image */}
      {project.imageUrl ? (
        <Image source={{ uri: project.imageUrl }} style={styles.heroImage} resizeMode="cover" />
      ) : (
        <View style={[styles.heroPlaceholder, { backgroundColor: colors.muted }]}>
          <Feather name="cpu" size={48} color={colors.primary} />
        </View>
      )}

      <View style={styles.body}>
        {/* Course badge */}
        {project.courseName ? (
          <View style={[styles.courseBadge, { backgroundColor: colors.primary + '22', borderRadius: 6 }]}>
            <Text style={[styles.courseBadgeText, { color: colors.primary }]}>{project.courseName}</Text>
          </View>
        ) : null}

        {/* Title */}
        <Text style={[styles.title, { color: colors.foreground }]}>{project.title}</Text>

        {/* Author + date */}
        <View style={styles.authorRow}>
          <Feather name="user" size={13} color={colors.mutedForeground} />
          <Text style={[styles.authorText, { color: colors.mutedForeground }]}>
            {project.authorUsername ?? 'Anonymous'} · {new Date(project.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Upvote button */}
        <View style={styles.upvoteRow}>
          <Pressable
            onPress={handleUpvote}
            disabled={upvotePending || hasUpvoted}
            style={({ pressed }) => [
              styles.upvoteBtn,
              {
                backgroundColor: hasUpvoted ? colors.primary : colors.card,
                borderColor: colors.primary,
                borderRadius: colors.radius,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Animated.View style={[styles.upvoteBtnInner, animatedStyle]}>
              <Feather
                name="chevrons-up"
                size={20}
                color={hasUpvoted ? colors.primaryForeground : colors.primary}
              />
              <Text
                style={[
                  styles.upvoteCount,
                  { color: hasUpvoted ? colors.primaryForeground : colors.primary },
                ]}
              >
                {project.upvotes + (hasUpvoted ? 0 : 0)}
              </Text>
            </Animated.View>
          </Pressable>
          {hasUpvoted ? (
            <Text style={[styles.upvotedLabel, { color: colors.primary }]}>Upvoted!</Text>
          ) : null}
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: colors.foreground }]}>{project.description}</Text>

        {/* Meta grid */}
        <View style={styles.metaGrid}>
          {project.difficultyLevel ? <MetaBadge label="Difficulty" value={project.difficultyLevel} /> : null}
          {project.costLevel ? <MetaBadge label="Cost" value={project.costLevel} /> : null}
          {project.teamMembers ? <MetaBadge label="Team" value={project.teamMembers} /> : null}
          {project.componentsTags ? <MetaBadge label="Components" value={project.componentsTags} /> : null}
        </View>

        {/* Challenges */}
        {project.challengesText ? (
          <View style={[styles.section, { borderTopColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Challenges</Text>
            <Text style={[styles.sectionText, { color: colors.mutedForeground }]}>{project.challengesText}</Text>
          </View>
        ) : null}

        {/* Links */}
        {(project.inspiredByLink || project.reportLink || project.videoLink) ? (
          <View style={[styles.section, { borderTopColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Links</Text>
            {project.reportLink ? (
              <View style={styles.linkRow}>
                <Feather name="file-text" size={14} color={colors.primary} />
                <Text style={[styles.linkText, { color: colors.primary }]} numberOfLines={1}>{project.reportLink}</Text>
              </View>
            ) : null}
            {project.videoLink ? (
              <View style={styles.linkRow}>
                <Feather name="video" size={14} color={colors.primary} />
                <Text style={[styles.linkText, { color: colors.primary }]} numberOfLines={1}>{project.videoLink}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Comments section header */}
        <View style={[styles.section, { borderTopColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Comments {commentsData.length > 0 ? `(${commentsData.length})` : ''}
          </Text>

          {/* Add comment */}
          {user ? (
            <View style={[styles.commentInputRow, { borderColor: colors.border, borderRadius: colors.radius, backgroundColor: colors.card }]}>
              <TextInput
                style={[styles.commentInput, { color: colors.foreground }]}
                placeholder="Add a comment…"
                placeholderTextColor={colors.mutedForeground}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <Pressable
                onPress={handleComment}
                disabled={!commentText.trim() || commentPending}
                style={({ pressed }) => [
                  styles.commentSendBtn,
                  { backgroundColor: colors.primary, borderRadius: 6, opacity: pressed || !commentText.trim() ? 0.6 : 1 },
                ]}
              >
                {commentPending
                  ? <ActivityIndicator color={colors.primaryForeground} size="small" />
                  : <Feather name="send" size={16} color={colors.primaryForeground} />
                }
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => router.push('/(tabs)/account')}
              style={[styles.signInPrompt, { backgroundColor: colors.muted, borderRadius: 8 }]}
            >
              <Feather name="log-in" size={14} color={colors.mutedForeground} />
              <Text style={[styles.signInText, { color: colors.mutedForeground }]}>Sign in to comment</Text>
            </Pressable>
          )}
        </View>

        {commentsLoading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} /> : null}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={commentsData}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            isOwner={user?.id === item.userId}
            onDelete={() => {}}
          />
        )}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={[styles.listContent, { paddingBottom: Platform.OS === 'web' ? 34 + 84 : 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          !commentsLoading ? (
            <Text style={[styles.noComments, { color: colors.mutedForeground }]}>No comments yet</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  heroImage: {
    width: '100%',
    height: 220,
  },
  heroPlaceholder: {
    width: '100%',
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
    gap: 14,
  },
  courseBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  courseBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 32,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorText: {
    fontSize: 13,
  },
  upvoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upvoteBtn: {
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  upvoteBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upvoteCount: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  upvotedLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  section: {
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkText: {
    fontSize: 13,
    flex: 1,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    minHeight: 36,
  },
  commentSendBtn: {
    padding: 8,
  },
  signInPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  signInText: {
    fontSize: 14,
  },
  noComments: {
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 0,
  },
  commentItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  commentAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600' as const,
    flex: 1,
  },
  commentDate: {
    fontSize: 11,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorMsg: {
    fontSize: 15,
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
});
