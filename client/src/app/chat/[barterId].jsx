import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useFocusEffect } from "expo-router";

import { getMessages, sendMessage } from "../../services/api";
import { getCurrentUserId } from "../../services/auth";

export default function Chat() {
  const { barterId } = useLocalSearchParams();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [sending, setSending] = useState(false);

  const messagesRef = useRef([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const loadMessages = useCallback(async () => {
    if (!barterId) return;

    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      const data = await getMessages(barterId);
      setCurrentUserId(userId);
      setMessages(data || []);
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [barterId]);

  const refreshMessagesSilently = useCallback(async () => {
    if (!barterId) return;

    try {
      const data = await getMessages(barterId);
      const fetchedMessages = data || [];

      const hasChanged =
        JSON.stringify(fetchedMessages) !== JSON.stringify(messagesRef.current);

      if (hasChanged) {
        setMessages(fetchedMessages);
      }
    } catch (error) {
      // Silent failure: keep the currently displayed messages as-is.
      console.error(error);
    }
  }, [barterId]);

  useFocusEffect(
    useCallback(() => {
      loadMessages();

      const intervalId = setInterval(() => {
        refreshMessagesSilently();
      }, 4000);

      return () => {
        clearInterval(intervalId);
      };
    }, [loadMessages, refreshMessagesSilently])
  );

  const handleSend = async () => {
    const trimmed = textInput.trim();

    if (!trimmed) return;

    try {
      setSending(true);
      await sendMessage(barterId, trimmed);
      setTextInput("");
      await loadMessages();
    } catch (error) {
      console.error(error);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && messages.length === 0) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      >
        {messages.map((message) => {
          const isOwnMessage = String(message.senderId) === String(currentUserId);

          return (
            <View
              key={message._id}
              style={[
                styles.messageRow,
                isOwnMessage ? styles.ownMessageRow : styles.otherMessageRow,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                ]}
              >
                {message.text}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {error && (
        <Text style={styles.inlineError}>{error}</Text>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={textInput}
          onChangeText={setTextInput}
          multiline
        />

        <Pressable
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={sending}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  messageList: {
    flex: 1,
  },

  messageListContent: {
    padding: 16,
  },

  messageRow: {
    maxWidth: "80%",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  ownMessageRow: {
    alignSelf: "flex-end",
    backgroundColor: "#7c3aed",
  },

  otherMessageRow: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
  },

  messageText: {
    fontSize: 14,
  },

  ownMessageText: {
    color: "#fff",
  },

  otherMessageText: {
    color: "#000",
  },

  inlineError: {
    color: "#dc2626",
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },

  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#7c3aed",
  },

  sendButtonDisabled: {
    backgroundColor: "#c4b5e6",
  },

  sendButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
