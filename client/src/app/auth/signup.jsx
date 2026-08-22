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
import { signup } from "../../services/api";
import { saveToken } from "../../services/auth";
import { Colors } from "../../constants/tokens";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [error, setError] = useState("");

  // Validation
  const validNyuEmail = email.toLowerCase().endsWith("@nyu.edu");

  const passwordsMatch =
    password.length > 0 &&
    password === verifyPassword;

  const validPassword = password.length >= 8;

  const validGradYear =
    role !== "Undergrad" && role !== "Grad"
      ? true
      : gradYear.trim() !== "";

  const validUsername = /^[^\sA-Z]+$/.test(username);

  const formValid =
    validNyuEmail &&
    validPassword &&
    passwordsMatch &&
    name.trim() !== "" &&
    validUsername &&
    role !== "" &&
    validGradYear;

  const handleSignup = async () => {
    if (!formValid) {
      return;
    }

    try {
      const data = await signup({
        email,
        password,
        verifyPassword,
        name,
        username,
        role,
        gradYear:
          role === "Undergrad" || role === "Grad" || role === "Alumni"
            ? gradYear
            : undefined,
      });

      console.log("Signup successful:", data);

      if (!data.token) {
        throw new Error("Signup response missing token");
      }

      await saveToken(data.token);

      router.replace("/explore");
    } catch (error) {
      setError(error.message);
      console.error("Signup failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {/* EMAIL */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {Boolean(email.length > 0 && !validNyuEmail) && (
        <Text style={styles.error}>
          Email must end with @nyu.edu
        </Text>
      )}

      {/* PASSWORD */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {Boolean(password.length > 0 && !validPassword) && (
        <Text style={styles.error}>
          Password must be at least 8 characters
        </Text>
      )}

      {/* VERIFY PASSWORD */}
      <TextInput
        style={styles.input}
        placeholder="Verify Password"
        value={verifyPassword}
        onChangeText={setVerifyPassword}
        secureTextEntry
      />

      {Boolean(verifyPassword.length > 0 && !passwordsMatch) && (
        <Text style={styles.error}>
          Passwords do not match
        </Text>
      )}

      {Boolean(verifyPassword.length > 0 && passwordsMatch) && (
        <Text style={styles.success}>
          Passwords match
        </Text>
      )}

      {/* NAME */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      {Boolean(name.length === 0) && (
        <Text style={styles.helper}>
          Name is required
        </Text>
      )}

      {/* USERNAME */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      {Boolean(username.length > 0 && !validUsername) && (
        <Text style={styles.error}>
          Username must be lowercase with no spaces
        </Text>
      )}

      {/* ROLE */}
      <Text style={styles.label}>Role</Text>

      <View style={styles.roleContainer}>
        <Pressable
          style={[
            styles.roleButton,
            role === "Undergrad" && styles.selectedRoleButton,
          ]}
          onPress={() => setRole("Undergrad")}
        >
          <Text
            style={[
              styles.roleText,
              role === "Undergrad" && styles.selectedRoleText,
            ]}
          >
            Undergrad
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.roleButton,
            role === "Grad" && styles.selectedRoleButton,
          ]}
          onPress={() => setRole("Grad")}
        >
          <Text
            style={[
              styles.roleText,
              role === "Grad" && styles.selectedRoleText,
            ]}
          >
            Graduate
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.roleButton,
            role === "Alumni" && styles.selectedRoleButton,
          ]}
          onPress={() => setRole("Alumni")}
        >
          <Text
            style={[
              styles.roleText,
              role === "Alumni" && styles.selectedRoleText,
            ]}
          >
            Alumni
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.roleButton,
            role === "Professor" && styles.selectedRoleButton,
          ]}
          onPress={() => setRole("Professor")}
        >
          <Text
            style={[
              styles.roleText,
              role === "Professor" && styles.selectedRoleText,
            ]}
          >
            Professor
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.roleButton,
            role === "Staff" && styles.selectedRoleButton,
          ]}
          onPress={() => setRole("Staff")}
        >
          <Text
            style={[
              styles.roleText,
              role === "Staff" && styles.selectedRoleText,
            ]}
          >
            Staff
          </Text>
        </Pressable>
      </View>

      {/* GRADUATION YEAR */}
      {Boolean(role === "Undergrad" || role === "Grad") && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Graduation Year"
            value={gradYear}
            onChangeText={setGradYear}
            keyboardType="numeric"
          />

          {Boolean(gradYear.length === 0) && (
            <Text style={styles.error}>
              Graduation year is required
            </Text>
          )}
        </>
      )}

      {/* CREATE ACCOUNT */}
      <Pressable
        disabled={!formValid}
        style={[
          styles.signupButton,
          !formValid && styles.signupButtonDisabled,
        ]}
        onPress={handleSignup}
      >
        <Text style={styles.signupButtonText}>
          Create Account
        </Text>
      </Pressable>

      {Boolean(error) && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      {/* LOGIN */}
      <Button
        title="Already have an account?"
        onPress={() => router.push("/auth/login")}
      />
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

  label: {
    fontWeight: "bold",
    marginTop: 5,
    color: Colors.textPrimary,
  },

  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
  },

  roleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    alignItems: "center",
  },

  selectedRoleButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  roleText: {
    color: Colors.textPrimary,
  },

  selectedRoleText: {
    color: Colors.surface,
    fontWeight: "bold",
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