import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import ResponseRow from "./ResponseRow";
import { Colors } from "../../constants/tokens";

const MAX_RESPONSES = 5;

export default function ResponseList({ title, items, setItems }) {
  const canAddResponse = items.every(
    (item) =>
      item.description.trim() !== "" &&
      item.category !== ""
  );

  const handleAddResponse = () => {
    if (!canAddResponse) {
      return;
    }

    setItems([
      ...items,
      {
        description: "",
        category: "",
      },
    ]);
  };

  const handleChange = (index, updatedItem) => {
    const updatedItems = [...items];
    updatedItems[index] = updatedItem;
    setItems(updatedItems);
  };

  const handleRemove = (index) => {
        if (items.length === 1) {
            return;
        }

        const updatedItems = items.filter(
            (_, itemIndex) => itemIndex !== index
        );

        setItems(updatedItems);
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {items.map((item, index) => (
        <ResponseRow
          key={item._id ?? index}
          item={item}
          onChange={(updatedItem) =>
            handleChange(index, updatedItem)
          }
          onRemove={() => handleRemove(index)}
        />
      ))}

      {items.length < MAX_RESPONSES && (
        <Pressable
          style={styles.addButton}
          onPress={handleAddResponse}
          disabled={!canAddResponse}
        >
          <Text style={styles.addButtonText}>
            + Add another
          </Text>
        </Pressable>
      )}

      <Text style={styles.counter}>
        {items.length}/{MAX_RESPONSES}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.textPrimary,
  },

  addButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  addButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
  },

  counter: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});