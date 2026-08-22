import { View, Text, Button, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Colors } from "../constants/tokens";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TradingJoe</Text>

      <Button
        title="Login"
        onPress={() => router.push("/auth/login")}
      />
      <Button
        title="Test"
        onPress={() => router.push("/screens/test")}
      />

      <Button
        title="Sign Up"
        onPress={() => router.push("/auth/signup")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: Colors.background,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.textPrimary,
  },
});