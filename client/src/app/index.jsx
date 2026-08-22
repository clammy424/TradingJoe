import { View, Text, Button, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { getCurrentUserId } from "../services/auth";



export default function Index() {
  const [currentUserId, setCurrentUserId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      getCurrentUserId().then((userId) => {
        if (isMounted) {
          setCurrentUserId(userId);
        }
      });

      return () => {
        isMounted = false;
      };
    }, [])
  );

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
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
});