import {
  View,
  Text,
  Pressable,
  StyleSheet
} from "react-native";
import { Colors } from "../../constants/tokens";

export default function PostCard({ post, onPress, style }) {
  return (
    <Pressable
      style={[styles.card, style]}
      onPress={onPress}
    >

      {Boolean(post.creatorId?.username) && (
        <Text style={styles.username}>
          @{post.creatorId.username}
        </Text>
      )}

      <Text style={styles.title}>
        {post.title}
      </Text>

      <Text
        style={styles.description}
        numberOfLines={2}
      >
        {post.description}
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>
          REQUESTING
        </Text>

        <Text>
          Requests: {post.requestCount || 0}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>
          OFFERING
        </Text>

        <Text>
          Offers: {post.offerCount || 0}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>
          BARTERS
        </Text>

        <Text>
          Active Barters: {post.activeBarterCount || 0}
        </Text>

        <Text>
          Matches: {post.acceptedBarterCount || 0}/{post.maxMatches ?? 1}
        </Text>
      </View>

    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  username: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.textPrimary,
  },

  description: {
    fontSize: 14,
    marginBottom: 16,
    color: Colors.textBody,
  },

  section: {
    marginBottom: 6,
  },

  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textSecondary,
  },
});