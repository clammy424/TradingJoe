import { View, Text, Pressable, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";

import { getMyBarters } from "../../services/api";
import { Colors } from "../../constants/tokens";

export default function MyBarters() {
  const [barters, setBarters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBarters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyBarters();
      setBarters(data || []);
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Failed to load barters");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBarters();
    }, [loadBarters])
  );

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
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Barters</Text>

      <FlatList
        data={barters}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.barterRow}>
            {Boolean(item.postId?.title) && (
              <Text style={styles.postTitle}>{item.postId.title}</Text>
            )}

            {Boolean(item.postId?.creatorId?.username) && (
              <Text style={styles.postOwner}>
                @{item.postId.creatorId.username}
              </Text>
            )}

            <Text style={styles.message}>{item.message}</Text>

            <Text style={styles.status}>{item.status}</Text>

            {Boolean(item._id) && (
              <Pressable
                style={styles.chatButton}
                onPress={() => router.push(`/chat/${item._id}`)}
              >
                <Text style={styles.chatButtonText}>Chat</Text>
              </Pressable>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>You haven't proposed any barters yet.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
    backgroundColor: Colors.background,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: Colors.textPrimary,
  },

  listContent: {
    paddingBottom: 30,
  },

  barterRow: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
    color: Colors.textPrimary,
  },

  postOwner: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 6,
  },

  message: {
    fontSize: 14,
    marginBottom: 6,
    color: Colors.textBody,
  },

  status: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },

  chatButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  chatButtonText: {
    color: Colors.surface,
    fontSize: 13,
    fontWeight: "600",
  },
});
