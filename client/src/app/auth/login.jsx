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
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },

  error: {
    color: "red",
    fontSize: 12,
  },

  success: {
    color: "green",
    fontSize: 12,
  },

  helper: {
    color: "#777",
    fontSize: 12,
  },

  signupButton: {
    backgroundColor: "#7c3aed",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  signupButtonDisabled: {
    backgroundColor: "#ccc",
  },

  signupButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
