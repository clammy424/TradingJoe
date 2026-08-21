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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
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
    >
      <View style={styles.header}>
        {Boolean(profile.username) && (
          <Text style={styles.username}>@{profile.username}</Text>
        )}

        {Boolean(profile.name) && (
          <Text style={styles.name}>{profile.name}</Text>
        )}

        {Boolean(metaText) && (
          <Text style={styles.meta}>{metaText}</Text>
        )}
      </View>

      <Text style={styles.postsHeading}>Posts</Text>

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
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

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
            <Text style={styles.emptyText}>
              No {activeLabel.toLowerCase()} posts.
            </Text>
          );
        }

        return activePosts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onPress={() => router.push(`/post/${post._id}`)}
          />
        ));
      })()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  listContent: {
    paddingBottom: 30,
  },

  header: {
    marginBottom: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  postsHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 6,
  },

  tabRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },

  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#7c3aed",
  },

  tabActive: {
    backgroundColor: "#7c3aed",
  },

  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7c3aed",
  },

  tabTextActive: {
    color: "#fff",
  },

  emptyText: {
    fontSize: 13,
    color: "#777",
  },

  username: {
    fontSize: 22,
    fontWeight: "bold",
  },

  name: {
    fontSize: 16,
    marginTop: 4,
  },

  meta: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#777",
    marginTop: 4,
  },
});
