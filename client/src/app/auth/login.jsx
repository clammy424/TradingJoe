import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { login } from "../../services/api";
import { saveToken } from "../../services/auth";
import { Colors } from "../../constants/tokens";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validNyuEmail = email.toLowerCase().endsWith("@nyu.edu");

  const formValid =
    validNyuEmail &&
    password!="";
  
  const handleLogin = async () => {
      if (!formValid) {
        return;
      }
  
      try {
        const data = await login({
          email,
          password
        });
        console.log("LOGIN RESPONSE:", data);

        if (!data.token) {
          throw new Error("Login response missing token");
        }

        await saveToken(data.token);
  
        console.log("Login successful:", data);
  
        router.replace("/explore");
        
      } catch (error) {
        setError(error.message);
        console.error("Login failed:", error);
      }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title="Login"
        onPress={ handleLogin }
      />

      <Button
        title="Create an account"
        onPress={() => router.push("/auth/signup")}
      />

      {Boolean(error) && (
              <Text style={styles.error}>
                {error}
              </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 10,
    backgroundColor: Colors.background,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.textPrimary,
  },

  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },

  error: {
    color: Colors.error,
    fontSize: 12,
  },

  success: {
    color: Colors.success,
    fontSize: 12,
  },

  helper: {
    color: Colors.textSecondary,
    fontSize: 12,
  },

  signupButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  signupButtonDisabled: {
    backgroundColor: Colors.border,
  },

  signupButtonText: {
    color: Colors.surface,
    fontWeight: "bold",
    fontSize: 16,
  },
});
