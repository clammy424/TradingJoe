import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";

import { getUserProfile, getUserPosts } from "../../services/api";
import { getCurrentUserId } from "../../services/auth";
import PostCard from "../post/PostCard";

const STATUS_TABS = [
  { status: "open", label: "Open" },
  { status: "closed", label: "Closed" },
  { status: "cancelled", label: "Cancelled" },
];

export default function Profile() {
  const { userId } = useLocalSearchParams();

  console.log("[Profile] received userId param:", userId);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState("open");
  const [currentUserId, setCurrentUserId] = useState(null);

  const isValidUserId = Boolean(userId) && userId !== "undefined" && userId !== "null";

  const loadProfile = useCallback(async () => {
    if (!isValidUserId) {
      setLoading(false);
      setError("No user specified");
      return;
    }

    try {
      setLoading(true);
      const viewerId = await getCurrentUserId();
      setCurrentUserId(viewerId);
      const data = await getUserProfile(userId);
      setProfile(data);
      const userPosts = await getUserPosts(userId);
      setPosts(userPosts);
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [userId, isValidUserId]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const metaParts = [];

  if (profile.role) metaParts.push(profile.role);
  if (profile.gradYear != null) metaParts.push(profile.gradYear);

  const metaText = metaParts.join(" · ");

  const isOwnProfile = Boolean(currentUserId) && String(currentUserId) === String(userId);

  const visibleTabs = isOwnProfile
    ? STATUS_TABS
    : STATUS_TABS.filter((tab) => tab.status !== "cancelled");

  const effectiveStatus =
    isOwnProfile || activeStatus !== "cancelled" ? activeStatus : "open";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        {Boolean(profile.username) && (
          <Text
            style={styles.username}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            @{profile.username}
          </Text>
        )}

        {Boolean(profile.name) && (
          <Text
            style={styles.name}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {profile.name}
          </Text>
        )}

        {Boolean(metaText) && (
          <Text style={styles.meta}>{metaText}</Text>
        )}
      </View>

      <View style={styles.tabRow}>
        {visibleTabs.map(({ status, label }) => (
          <Pressable
            key={status}
            style={[styles.tab, effectiveStatus === status && styles.tabActive]}
            onPress={() => setActiveStatus(status)}
          >
            <Text
              style={[
                styles.tabText,
                effectiveStatus === status && styles.tabTextActive,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.postsContainer}>
        {(() => {
          const activeLabel = STATUS_TABS.find(
            (tab) => tab.status === effectiveStatus
          ).label;

          const activePosts = posts.filter(
            (post) =>
              post.status === effectiveStatus &&
              (isOwnProfile || post.status !== "cancelled")
          );

          if (activePosts.length === 0) {
            return (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No {activeLabel.toLowerCase()} posts yet.
                </Text>
              </View>
            );
          }

          return activePosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              style={styles.postCardShadow}
              onPress={() => router.push(`/post/${post._id}`)}
            />
          ));
        })()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  listContent: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },

  header: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  username: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0.2,
  },

  name: {
    fontSize: 16,
    color: "#333",
    marginTop: 4,
  },

  meta: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#777",
    marginTop: 6,
  },

  tabRow: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },

  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  tabActive: {
    backgroundColor: "#7c3aed",
  },

  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },

  tabTextActive: {
    color: "#fff",
  },

  postsContainer: {
    flex: 1,
  },

  postCardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },

  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },

  errorText: {
    fontSize: 14,
    color: "#dc2626",
    textAlign: "center",
  },
});
