import React from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
} from "react-native";
import { RESPONSE_CATEGORIES } from "../../constants/ResponseCategories.js";
import { Colors } from "../../constants/tokens";

export default function ResponseRow({
  item,
  onChange,
  onRemove,
}) {
  const { description, category, status } = item;
  const isLocked = status === "accepted" || status === "rejected";

  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        placeholder="What are you requesting/offering?"
        value={description}
        editable={!isLocked}
        onChangeText={(text) =>
          onChange({
            ...item,
            description: text,
          })
        }
      />

      <select
        value={category}
        disabled={isLocked}
        onChange={(event) =>
          onChange({
            ...item,
            category: event.target.value,
          })
        }
        style={styles.select}
      >
        <option value="">Category</option>

        {RESPONSE_CATEGORIES.map((categoryOption) => (
          <option key={categoryOption} value={categoryOption}>
            {categoryOption}
          </option>
        ))}
      </select>

      {!isLocked && (
        <Pressable
          style={styles.removeButton}
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel="Remove item"
        >
          <Text style={styles.removeText}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    fontSize: 14,
  },

  select: {
    width: 120,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    fontSize: 14,
  },

  removeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  removeText: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
});