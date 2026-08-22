import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { getPostById } from "../../services/api";
import { Colors } from "../../constants/tokens";

export default function Barters() {
  const { postId } = useLocalSearchParams();

  const [barters, setBarters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) return;

    const fetchBarters = async () => {
      try {
        setLoading(true);
        const data = await getPostById(postId);
        setBarters(data.barters || []);
      } catch (error) {
        console.error(error);
        setError("Failed to load barters");
      } finally {
        setLoading(false);
      }
    };

    fetchBarters();
  }, [postId]);

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
      <Text style={styles.title}>Barters</Text>

      {barters.map((barter) => (
        <View key={barter._id} style={styles.barterRow}>
          <Text style={styles.message}>{barter.message}</Text>
          <Text style={styles.status}>{barter.status}</Text>
        </View>
      ))}
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
    backgroundColor: Colors.background,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.textPrimary,
  },

  barterRow: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },

  message: {
    fontSize: 14,
    color: Colors.textBody,
  },

  status: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
