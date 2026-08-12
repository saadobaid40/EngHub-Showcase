import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useGetTrendingProjects, useGetPlatformStats, useListProjects, getListProjectsQueryKey } from '@workspace/api-client-react';
import type { Project } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ProjectCard } from '@/components/ProjectCard';

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <Feather name={icon as any} size={18} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value.toLocaleString()}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  const colors = useColors();
  return (
    <View style={styles.emptyState}>
      <Feather name="inbox" size={36} color={colors.mutedForeground} />
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{message}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [viewAll, setViewAll] = useState(false);

  const { data: trending, isLoading: trendingLoading, refetch: refetchTrending } = useGetTrendingProjects();
  const { data: stats, refetch: refetchStats } = useGetPlatformStats();
  const { data: recent, isLoading: recentLoading, refetch: refetchRecent } = useListProjects(
    { sort: 'newest' },
    { query: { enabled: viewAll, queryKey: getListProjectsQueryKey({ sort: 'newest' }) } }
  );

  const projects: Project[] = viewAll ? (recent ?? []) : (trending ?? []);
  const isLoading = viewAll ? recentLoading : trendingLoading;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTrending(), refetchStats(), refetchRecent()]);
    setRefreshing(false);
  };

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const ListHeader = (
    <View>
      {/* Hero header */}
      <View style={[styles.heroSection, { paddingTop: topInset + 16 }]}>
        <Text style={[styles.heroTitle, { color: colors.primary }]}>EngiNexus</Text>
        <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>Engineering Projects Showcase</Text>
      </View>

      {/* Stats */}
      {stats ? (
        <View style={styles.statsRow}>
          <StatCard label="Projects" value={stats.totalProjects} icon="folder" />
          <StatCard label="Students" value={stats.totalUsers} icon="users" />
          <StatCard label="Upvotes" value={stats.totalUpvotes} icon="chevrons-up" />
        </View>
      ) : null}

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionToggle}>
          <Pressable
            onPress={() => setViewAll(false)}
            style={[styles.toggleBtn, !viewAll && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.toggleText, { color: !viewAll ? colors.primaryForeground : colors.mutedForeground }]}>
              Trending
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewAll(true)}
            style={[styles.toggleBtn, viewAll && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.toggleText, { color: viewAll ? colors.primaryForeground : colors.mutedForeground }]}>
              Recent
            </Text>
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={isLoading ? [] : projects}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={() => router.push(`/project/${item.id}`)}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !isLoading ? <EmptyState message="No projects found" /> : null
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        scrollEnabled={projects.length > 0 || !isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  statLabel: {
    fontSize: 11,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionToggle: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 8,
    gap: 6,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'web' ? 34 + 84 : 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
});
