import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useGetCourseBreakdown, useListProjects } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ProjectCard } from '@/components/ProjectCard';

export default function BrowseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<'newest' | 'upvotes'>('newest');
  const [refreshing, setRefreshing] = useState(false);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const { data: courses } = useGetCourseBreakdown();
  const {
    data: projects,
    isLoading,
    refetch,
  } = useListProjects({
    search: search.length >= 2 ? search : undefined,
    course_name: selectedCourse,
    sort,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const ListHeader = (
    <View style={{ paddingTop: topInset + 12 }}>
      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search projects…"
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && Platform.OS !== 'ios' ? (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>

      {/* Course filter chips */}
      {courses && courses.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          style={styles.chipsScroll}
        >
          <Pressable
            style={[
              styles.chip,
              {
                backgroundColor: !selectedCourse ? colors.primary : colors.card,
                borderColor: !selectedCourse ? colors.primary : colors.border,
                borderRadius: 20,
              },
            ]}
            onPress={() => setSelectedCourse(undefined)}
          >
            <Text style={[styles.chipText, { color: !selectedCourse ? colors.primaryForeground : colors.mutedForeground }]}>
              All
            </Text>
          </Pressable>

          {courses.map((c) => (
            <Pressable
              key={c.courseName}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedCourse === c.courseName ? colors.primary : colors.card,
                  borderColor: selectedCourse === c.courseName ? colors.primary : colors.border,
                  borderRadius: 20,
                },
              ]}
              onPress={() =>
                setSelectedCourse(selectedCourse === c.courseName ? undefined : c.courseName)
              }
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selectedCourse === c.courseName ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {c.courseName}
                <Text style={{ opacity: 0.7 }}> {c.count}</Text>
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {/* Sort controls */}
      <View style={[styles.sortBar, { borderBottomColor: colors.border }]}>
        <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
          {isLoading ? '…' : `${(projects ?? []).length} projects`}
        </Text>
        <View style={styles.sortButtons}>
          <Pressable
            style={[styles.sortBtn, sort === 'newest' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setSort('newest')}
          >
            <Text style={[styles.sortBtnText, { color: sort === 'newest' ? colors.primary : colors.mutedForeground }]}>
              Newest
            </Text>
          </Pressable>
          <Pressable
            style={[styles.sortBtn, sort === 'upvotes' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setSort('upvotes')}
          >
            <Text style={[styles.sortBtnText, { color: sort === 'upvotes' ? colors.primary : colors.mutedForeground }]}>
              Top Rated
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
        data={isLoading ? [] : (projects ?? [])}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={() => router.push(`/project/${item.id}`)}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Feather name="search" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {search.length >= 2 ? 'No results found' : 'Start searching or choose a course'}
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        scrollEnabled={!isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  chipsScroll: {
    marginBottom: 8,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  resultCount: {
    fontSize: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  sortBtn: {
    paddingBottom: 4,
    paddingHorizontal: 2,
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: '500' as const,
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
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
