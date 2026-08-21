import {
  View,
  Text,
  Pressable,
  StyleSheet
} from "react-native";

export default function PostCard({ post, onPress }) {
  return (
    <Pressable
      style={styles.card}
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
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },

  username: {
    fontSize: 13,
    color: "#7c3aed",
    fontWeight: "600",
    marginBottom: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    marginBottom: 16,
  },

  section: {
    marginBottom: 6,
  },

  label: {
    fontSize: 12,
    fontWeight: "bold",
  },
});