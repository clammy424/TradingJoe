import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";

import { getUserProfile, getUserPosts, getEngagedPosts } from "../../services/api";
import { getCurrentUserId, removeToken } from "../../services/auth";
import PostCard from "../post/PostCard";
import { Colors } from "../../constants/tokens";

const STATUS_TABS = [
  { status: "open", label: "Open" },
  { status: "closed", label: "Closed" },
  { status: "cancelled", label: "Cancelled" },
];

const ENGAGED_STATUS_TABS = [
  { status: "open", label: "Open" },
  { status: "closed", label: "Closed" },
];

export default function Profile() {
  const { userId } = useLocalSearchParams();

  console.log("[Profile] received userId param:", userId);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [engagedPosts, setEngagedPosts] = useState({ open: [], closed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("posts");
  const [activeStatus, setActiveStatus] = useState("open");
  const [engagedStatus, setEngagedStatus] = useState("open");
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

      if (viewerId && String(viewerId) === String(userId)) {
        const engaged = await getEngagedPosts();
        setEngagedPosts(engaged);
      }

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

  const handleLogout = async () => {
    try {
      await removeToken();
      router.replace("/auth/login");
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
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
      <View style={styles.topRow}>
        {Boolean(profile.username) && (
          <Text
            style={styles.username}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            @{profile.username}
          </Text>
        )}

        <View style={styles.topRowButtons}>
          {isOwnProfile && (
            <Pressable
              style={styles.createPostButton}
              onPress={() => router.push("/post/create-post")}
            >
              <Text style={styles.createPostButtonText}>
                + Create Post
              </Text>
            </Pressable>
          )}

          <Pressable
            style={styles.homeButton}
            onPress={() => router.replace("/explore")}
          >
            <Text style={styles.homeButtonText}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>
              Logout
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.header}>
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

      {isOwnProfile && (
        <View style={styles.viewTabRow}>
          <Pressable
            style={[
              styles.viewTab,
              activeView === "posts" && styles.viewTabActive,
            ]}
            onPress={() => {
              setActiveView("posts");
              setActiveStatus("open");
            }}
          >
            <Text
              style={[
                styles.viewTabText,
                activeView === "posts" && styles.viewTabTextActive,
              ]}
            >
              My Posts
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.viewTab,
              activeView === "engaged" && styles.viewTabActive,
            ]}
            onPress={() => {
              setActiveView("engaged");
              setEngagedStatus("open");
            }}
          >
            <Text
              style={[
                styles.viewTabText,
                activeView === "engaged" && styles.viewTabTextActive,
              ]}
            >
              Engaged Posts
            </Text>
          </Pressable>
        </View>
      )}

      {activeView === "engaged" && isOwnProfile ? (
        <>
          <Text style={styles.viewHeading}>Engaged Posts</Text>

          <View style={styles.tabRow}>
            {ENGAGED_STATUS_TABS.map(({ status, label }) => (
              <Pressable
                key={status}
                style={[
                  styles.tab,
                  engagedStatus === status && styles.tabActive,
                ]}
                onPress={() => setEngagedStatus(status)}
              >
                <Text
                  style={[
                    styles.tabText,
                    engagedStatus === status && styles.tabTextActive,
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
              const activeLabel = ENGAGED_STATUS_TABS.find(
                (tab) => tab.status === engagedStatus
              ).label;

              const activeEngagedPosts = engagedPosts[engagedStatus] || [];

              if (activeEngagedPosts.length === 0) {
                return (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No {activeLabel.toLowerCase()} engaged posts yet.
                    </Text>
                  </View>
                );
              }

              return activeEngagedPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  style={styles.postCardShadow}
                  onPress={() =>
                    router.push(`/post/${post._id}?from=profile&profileUserId=${userId}`)
                  }
                />
              ));
            })()}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.viewHeading}>My Posts</Text>

          <View style={styles.tabRow}>
            {visibleTabs.map(({ status, label }) => (
              <Pressable
                key={status}
                style={[
                  styles.tab,
                  effectiveStatus === status && styles.tabActive,
                ]}
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
                  onPress={() =>
                    router.push(`/post/${post._id}?from=profile&profileUserId=${userId}`)
                  }
                />
              ));
            })()}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.background,
    padding: 24,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  topRowButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  homeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },

  homeButtonText: {
    color: Colors.surface,
    fontWeight: "600",
    fontSize: 14,
  },

  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  logoutButtonText: {
    color: Colors.textBody,
    fontWeight: "600",
    fontSize: 14,
  },

  header: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  createPostButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },

  createPostButtonText: {
    color: Colors.surface,
    fontWeight: "600",
    fontSize: 14,
  },

  username: {
    flexShrink: 1,
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0.2,
    color: Colors.textPrimary,
  },

  name: {
    fontSize: 16,
    color: Colors.textBody,
    marginTop: 4,
  },

  meta: {
    fontSize: 13,
    fontStyle: "italic",
    color: Colors.textSecondary,
    marginTop: 6,
  },

  viewTabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 16,
  },

  viewTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },

  viewTabActive: {
    borderBottomColor: Colors.primary,
  },

  viewTabText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  viewTabTextActive: {
    color: Colors.primary,
  },

  viewHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: Colors.textPrimary,
  },

  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.primaryLight,
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
    backgroundColor: Colors.primary,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textBody,
  },

  tabTextActive: {
    color: Colors.surface,
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
    color: Colors.textSecondary,
    textAlign: "center",
  },

  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: "center",
  },
});
