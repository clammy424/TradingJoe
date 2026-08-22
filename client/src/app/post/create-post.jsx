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
import { Colors } from "../../constants/tokens";

const toLocalDateInputValue = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function CreatePost() {
  const { postId, from, profileUserId } = useLocalSearchParams();
  const isEditMode = !!postId;

  const backTarget =
    from === "profile" && profileUserId
      ? `/profile/${profileUserId}`
      : "/explore";

  const postDetailQuery = `${from ? `?from=${from}` : ""}${
    profileUserId ? `${from ? "&" : "?"}profileUserId=${profileUserId}` : ""
  }`;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [deadlineTime, setDeadlineTime] = useState("");
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
  const [acceptedMatchCount, setAcceptedMatchCount] = useState(0);

  const prefillFromExistingPost = async () => {
    try {
      const data = await getPostById(postId);

      setTitle(data.post.title || "");
      setDescription(data.post.description || "");
      const existingDeadline = data.post.deadline
        ? new Date(data.post.deadline)
        : null;
      setDeadline(existingDeadline);
      setDeadlineTime(
        existingDeadline
          ? `${String(existingDeadline.getHours()).padStart(2, "0")}:${String(
              existingDeadline.getMinutes()
            ).padStart(2, "0")}`
          : ""
      );
      setMaxMatches(
        data.post.maxMatches != null ? String(data.post.maxMatches) : 1
      );
      setPostStatus(data.post.status || null);
      setAcceptedMatchCount(
        (data.barters || []).filter((barter) => barter.status === "accepted").length
      );

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

  const combineDeadline = () => {
    if (!deadline) {
      return null;
    }
    const combined = new Date(deadline);
    if (deadlineTime) {
      const [hours, minutes] = deadlineTime.split(":").map(Number);
      combined.setHours(hours, minutes, combined.getSeconds(), combined.getMilliseconds());
    }
    return combined;
  };

  const combinedDeadline = combineDeadline();
  const deadlineInvalid = combinedDeadline !== null && isNaN(combinedDeadline.getTime());
  const deadlineInPast =
    combinedDeadline !== null &&
    !deadlineInvalid &&
    combinedDeadline.getTime() <= Date.now();

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

  const effectiveMaxMatches = maxMatches.trim() === "" ? 1 : Number(maxMatches);
  const maxMatchesInvalid =
    maxMatches.trim() !== "" &&
    (!Number.isInteger(effectiveMaxMatches) || effectiveMaxMatches < 1);
  const maxMatchesBelowAccepted =
    isEditMode && !maxMatchesInvalid && effectiveMaxMatches < acceptedMatchCount;
  const postCancelled = isEditMode && postStatus === "cancelled";

  const validationErrors = [];

  if (deadlineInvalid) {
    validationErrors.push("Invalid deadline.");
  } else if (deadlineInPast) {
    validationErrors.push("Deadline must be in the future.");
  }

  if (maxMatchesInvalid) {
    validationErrors.push("Max matches must be a whole number of 1 or more.");
  } else if (maxMatchesBelowAccepted) {
    validationErrors.push(
      `Max matches cannot be lower than the current number of accepted barters (${acceptedMatchCount}).`
    );
  }

  if (postCancelled) {
    validationErrors.push("This post is cancelled and cannot be edited.");
  }

  const formValid =
    title.trim() !== "" &&
    description.trim() !== "" &&
    !deadlineInvalid &&
    !deadlineInPast &&
    !maxMatchesInvalid &&
    !maxMatchesBelowAccepted &&
    !postCancelled &&
    hasCompleteResponse(requests) &&
    hasCompleteResponse(offers) &&
    allRequestsComplete &&
    allOffersComplete;

  const handleCreatePost = async () => {
    if (!formValid) {
      setError(
        validationErrors[0] || "Please fill out all required fields correctly."
      );
      return;
    }
    setError("");
    try {
        if (isEditMode) {
            const data = await updatePost(postId, {
                title,
                description,
                deadline: combinedDeadline ? combinedDeadline.toISOString() : null,
                maxMatches: maxMatches ? parseInt(maxMatches) : 1,
                requests: requests,
                offers: offers
            });
            console.log("Update Post Response:", data);
            router.replace(`/post/${data.post._id}${postDetailQuery}`);
            return;
        }

        const token = await getToken();
        if (!token) {
            throw new Error("No token found. Please log in.");
        }
        const data = await createPost({
            title,
            description,
            deadline: combinedDeadline ? combinedDeadline.toISOString() : null,
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
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace(backTarget)}
        >
          <Text style={styles.backButtonText}>
            ← Back
          </Text>
        </Pressable>

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
            value={deadline ? toLocalDateInputValue(deadline) : ""}
            min={toLocalDateInputValue(new Date())}
            onChange={(e) => {
              setDeadline(
                e.target.value ? new Date(`${e.target.value}T00:00:00`) : null
              );
            }}
            style={styles.input}
          />
        )}
        {Platform.OS === "web" && (
          <input
            type="time"
            value={deadlineTime}
            onChange={(e) => setDeadlineTime(e.target.value)}
            style={styles.input}
          />
        )}
        {deadlineInvalid && (
          <Text style={styles.error}>
            Invalid deadline.
          </Text>
        )}
        {!deadlineInvalid && deadlineInPast && (
          <Text style={styles.error}>
            Deadline must be in the future.
          </Text>
        )}
        <TextInput
            style={styles.input}
            placeholder="Max Matches"
            value={maxMatches}
            onChangeText={setMaxMatches}
            keyboardType="numeric"
        />
        {maxMatchesInvalid && (
          <Text style={styles.error}>
            Max matches must be a whole number of 1 or more.
          </Text>
        )}
        {!maxMatchesInvalid && maxMatchesBelowAccepted && (
          <Text style={styles.error}>
            Max matches cannot be lower than the current number of accepted barters ({acceptedMatchCount}).
          </Text>
        )}
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
        {postCancelled && (
          <Text style={styles.error}>
            This post is cancelled and cannot be edited.
          </Text>
        )}
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
    backgroundColor: Colors.background,
  },

  // responseContainer: {
  //   flexDirection: "row",
  //   justifyContent: "center"
  // },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.textPrimary,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  backButtonText: {
    color: Colors.surface,
    fontSize: 13,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: 'transparent',
    shadowOpacity: 0,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.surface
    // outlineStyle: 'none'
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

  createButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  createButtonDisabled: {
    backgroundColor: Colors.border,
  },

  createButtonText: {
    color: Colors.surface,
    fontWeight: "bold",
    fontSize: 16,
  },

  cancelPostButton: {
    backgroundColor: Colors.error,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  cancelPostText: {
    color: Colors.surface,
    fontWeight: "bold",
    fontSize: 16,
  },

  uncancelPostButton: {
    backgroundColor: Colors.success,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  uncancelPostText: {
    color: Colors.surface,
    fontWeight: "bold",
    fontSize: 16,
  },
});
