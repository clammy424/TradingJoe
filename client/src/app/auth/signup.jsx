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
    role !== "undergrad" && role !== "grad"
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
          role === "undergrad" || role === "grad"
            ? gradYear
            : undefined,
      });

      console.log("Signup successful:", data);

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
            role === "undergrad" && styles.selectedRoleButton,
          ]}
          onPress={() => setRole("undergrad")}
        >
          <Text
            style={[
              styles.roleText,
              role === "undergrad" && styles.selectedRoleText,
            ]}
          >
            Undergrad
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.roleButton,
            role === "grad" && styles.selectedRoleButton,
          ]}
          onPress={() => setRole("grad")}
        >
          <Text
            style={[
              styles.roleText,
              role === "grad" && styles.selectedRoleText,
            ]}
          >
            Graduate
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.roleButton,
            role === "professor" && styles.selectedRoleButton,
          ]}
          onPress={() => setRole("professor")}
        >
          <Text
            style={[
              styles.roleText,
              role === "professor" && styles.selectedRoleText,
            ]}
          >
            Professor
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.roleButton,
            role === "staff" && styles.selectedRoleButton,
          ]}
          onPress={() => setRole("staff")}
        >
          <Text
            style={[
              styles.roleText,
              role === "staff" && styles.selectedRoleText,
            ]}
          >
            Staff
          </Text>
        </Pressable>
      </View>

      {/* GRADUATION YEAR */}
      {Boolean(role === "undergrad" || role === "grad") && (
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

  label: {
    fontWeight: "bold",
    marginTop: 5,
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
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
  },

  selectedRoleButton: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },

  roleText: {
    color: "#000",
  },

  selectedRoleText: {
    color: "#fff",
    fontWeight: "bold",
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