import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  KeyboardAvoidingView
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { createPost, getPostById, updatePost, cancelPost, uncancelPost } from "../../services/api";
import { getToken } from "../../services/auth";

import ResponseList from "./ResponseList";

export default function CreatePost() {
  const { postId } = useLocalSearchParams();
  const isEditMode = !!postId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [maxMatches, setMaxMatches] = useState("");
  const [requests, setRequests] = useState([
    {
      description: "",
      category: "",
    },
  ]);

  const [offers, setOffers] = useState([
    {
      description: "",
      category: "",
    },
  ]);
  const [error, setError] = useState("");
  const [postStatus, setPostStatus] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUncancelling, setIsUncancelling] = useState(false);

  const prefillFromExistingPost = async () => {
    try {
      const data = await getPostById(postId);

      setTitle(data.post.title || "");
      setDescription(data.post.description || "");
      setDeadline(data.post.deadline ? new Date(data.post.deadline) : null);
      setMaxMatches(
        data.post.maxMatches != null ? String(data.post.maxMatches) : 1
      );
      setPostStatus(data.post.status || null);

      if (data.requests && data.requests.length > 0) {
        setRequests(data.requests);
      }

      if (data.offers && data.offers.length > 0) {
        setOffers(data.offers);
      }
    } catch (error) {
      setError(error.message);
      console.error("Prefill edit post failed:", error);
    }
  };

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    prefillFromExistingPost();
  }, [isEditMode, postId]);

  const handleCancelPost = async () => {
    setError("");
    setIsCancelling(true);
    try {
      await cancelPost(postId);
      await prefillFromExistingPost();
    } catch (error) {
      setError(error.message);
      console.error("Cancel post failed:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUncancelPost = async () => {
    setError("");
    setIsUncancelling(true);
    try {
      await uncancelPost(postId);
      await prefillFromExistingPost();
    } catch (error) {
      setError(error.message);
      console.error("Uncancel post failed:", error);
    } finally {
      setIsUncancelling(false);
    }
  };

  const hasCompleteResponse = (items) => {
    return items.some(
      (item) =>
        item.description.trim() !== "" &&
        item.category !== ""
    );
  };

  const allRequestsComplete = requests.every(
    (request) =>
      request.description.trim() !== "" &&
      request.category !== ""
  );

  const allOffersComplete = offers.every(
    (offer) =>
      offer.description.trim() !== "" &&
      offer.category !== ""
  );

  const formValid =
    title.trim() !== "" &&
    description.trim() !== "" &&
    (deadline === null || !isNaN(deadline.getTime())) &&
    (maxMatches === "" || !isNaN(parseInt(maxMatches))) &&
    hasCompleteResponse(requests) &&
    hasCompleteResponse(offers) &&
    allRequestsComplete &&
    allOffersComplete;
    
  const handleCreatePost = async () => {
    if (!formValid) {
      return;
    }
    setError("");
    try {
        if (isEditMode) {
            const data = await updatePost(postId, {
                title,
                description,
                deadline: deadline ? new Date(deadline) : null,
                maxMatches: maxMatches ? parseInt(maxMatches) : 1,
                requests: requests,
                offers: offers
            });
            console.log("Update Post Response:", data);
            router.replace(`/post/${data.post._id}`);
            return;
        }

        const token = await getToken();
        if (!token) {
            throw new Error("No token found. Please log in.");
        }
        const data = await createPost({
            title,
            description,
            deadline: deadline ? deadline.toISOString() : null,
            maxMatches: maxMatches ? parseInt(maxMatches) : 1,
            requests: requests,
            offers: offers
        }, token);
        console.log("Create Post Response:", data);
        router.replace(`/post/${data.post._id}`);
    }
    catch (error) {
        setError(error.message);
        console.error(isEditMode ? "Update Post failed:" : "Create Post failed:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Post</Text>
        {Boolean(error) && <Text style={styles.error}>{error}</Text>}
        <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
        />
        <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
        />
        {Platform.OS === "web" && (
          <input
            type="date"
            value={deadline ? deadline.toISOString().split("T")[0] : ""}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              setDeadline(
                e.target.value ? new Date(`${e.target.value}T00:00:00`) : null
              );
            }}
            style={styles.input}
          />
        )}
        <TextInput
            style={styles.input}
            placeholder="Max Matches"
            value={maxMatches}
            onChangeText={setMaxMatches}
            keyboardType="numeric"
        />
        <View>
          <ResponseList
          title="requesting"
          items={requests}
          setItems={setRequests}
          />
          <ResponseList
            title="offering"
            items={offers}
            setItems={setOffers}
          />
        </View>
        <Button
            title="Create Post"
            onPress={ handleCreatePost }
            disabled={!formValid}
        />
        {isEditMode && postStatus === "open" && (
          <Pressable
            style={styles.cancelPostButton}
            onPress={handleCancelPost}
            disabled={isCancelling}
          >
            <Text style={styles.cancelPostText}>
              {isCancelling ? "Cancelling..." : "Cancel Post"}
            </Text>
          </Pressable>
        )}
        {isEditMode && postStatus === "cancelled" && (
          <Pressable
            style={styles.uncancelPostButton}
            onPress={handleUncancelPost}
            disabled={isUncancelling}
          >
            <Text style={styles.uncancelPostText}>
              {isUncancelling ? "Uncancelling..." : "Uncancel Post"}
            </Text>
          </Pressable>
        )}
        {/* TODO: ADD OTHER FIELDS FOR POST */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    gap: 10,
  },

  // responseContainer: {
  //   flexDirection: "row",
  //   justifyContent: "center"
  // },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: 'transparent',
    shadowOpacity: 0,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff"
    // outlineStyle: 'none'
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

  createButton: {
    backgroundColor: "#7c3aed",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  createButtonDisabled: {
    backgroundColor: "#ccc",
  },

  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  cancelPostButton: {
    backgroundColor: "#dc2626",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  cancelPostText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  uncancelPostButton: {
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  uncancelPostText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
