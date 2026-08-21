import { View, Text, Pressable, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";

import { getMyBarters } from "../../services/api";

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
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },

  listContent: {
    paddingBottom: 30,
  },

  barterRow: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },

  postOwner: {
    fontSize: 13,
    color: "#7c3aed",
    fontWeight: "600",
    marginBottom: 6,
  },

  message: {
    fontSize: 14,
    marginBottom: 6,
  },

  status: {
    fontSize: 12,
    color: "#777",
    marginBottom: 8,
  },

  chatButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#7c3aed",
  },

  chatButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
