import { View, Text, Pressable, ActivityIndicator, StyleSheet, Modal, TextInput, ScrollView } from "react-native";
import { useCallback, useState } from "react";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";

import { getPostById, createBarter, acceptBarter, rejectBarter, getMyBartersForPost } from "../../services/api";
import { getCurrentUserId } from "../../services/auth";
import { Colors } from "../../constants/tokens";

// Muted accept/reject action colors, kept separate from the semantic
// success/error tokens so they don't affect other success/error UI.
const BARTER_ACCEPT_COLOR = "#5E9C7A";
const BARTER_REJECT_COLOR = "#B96B73";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatDeadline = (isoString) => {
  if (!isoString) {
    return "No deadline";
  }

  const date = new Date(isoString);
  const weekday = WEEKDAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const hours24 = date.getHours();
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  return `${weekday} ${month} ${day}, ${hours12}:${minutes} ${period}`;
};

export default function PostDetail() {
  const { postId, from, profileUserId } = useLocalSearchParams();

  const backTarget =
    from === "profile" && profileUserId
      ? `/profile/${profileUserId}`
      : "/explore";

  const editHref = `/post/create-post?postId=${postId}${
    from ? `&from=${from}` : ""
  }${profileUserId ? `&profileUserId=${profileUserId}` : ""}`;

  const [post, setPost] = useState(null);
  const [requests, setRequests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [barters, setBarters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isProposeModalVisible, setIsProposeModalVisible] = useState(false);
  const [offerInput, setOfferInput] = useState("");
  const [isBartersModalVisible, setIsBartersModalVisible] = useState(false);
  const [isMyBartersModalVisible, setIsMyBartersModalVisible] = useState(false);
  const [myBarters, setMyBarters] = useState([]);
  const [myBartersLoading, setMyBartersLoading] = useState(false);
  const [myBartersError, setMyBartersError] = useState(null);

  const loadPost = useCallback(async () => {
    if (!postId) return;

    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      const data = await getPostById(postId);
      setPost(data.post);
      setRequests(data.requests);
      setOffers(data.offers);
      setCurrentUserId(userId);
      setBarters(data.barters || []);
    } catch (error) {
      console.error(error);
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useFocusEffect(
    useCallback(() => {
      loadPost();
    }, [loadPost])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  const isCreator = Boolean(
    currentUserId &&
      String(post.creatorId?._id || post.creatorId) === String(currentUserId)
  );

  const acceptedCount = barters.filter(
    (barter) => barter.status === "accepted"
  ).length;

  const rejectedCount = barters.filter(
    (barter) => barter.status === "rejected"
  ).length;

  const barterCount = barters.length;

  const pendingCount = barters.filter(
    (barter) => barter.status === "pending"
  ).length;

  const openProposeModal = () => {
    setIsProposeModalVisible(true);
  };

  const handleAcceptBarter = async (barterId) => {
    try {
      await acceptBarter(barterId);
      await loadPost();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejectBarter = async (barterId) => {
    try {
      await rejectBarter(barterId);
      await loadPost();
    } catch (error) {
      console.error(error);
    }
  };

  const openMyBartersModal = async () => {
    setIsMyBartersModalVisible(true);
    setMyBartersLoading(true);
    setMyBartersError(null);

    try {
      const data = await getMyBartersForPost(post._id);
      setMyBarters(data || []);
    } catch (error) {
      console.error(error);
      setMyBartersError("Failed to load your barters");
    } finally {
      setMyBartersLoading(false);
    }
  };

  const closeMyBartersModal = () => {
    setIsMyBartersModalVisible(false);
  };

  const handleSubmitProposal = async () => {
    try {
      await createBarter(post._id, offerInput);
      setIsProposeModalVisible(false);
      setOfferInput("");
      await loadPost();
    } catch (error) {
      console.error(error);
    }
  };

  const renderResponseRow = (response) => (
    <View key={response._id} style={styles.responseCard}>
      {Boolean(response.category) && (
        <Text style={styles.responseCategory}>
          {response.category}
        </Text>
      )}
      <Text style={styles.value}>
        {response.description}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
    >

      <View style={styles.headerRow}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace(backTarget)}
        >
          <Text style={styles.backButtonText}>
            ← Back
          </Text>
        </Pressable>

        {isCreator && (
          <Pressable
                style={styles.editButton}
                onPress={() =>
                  router.push(editHref)
                }
              >

                <Text style={styles.viewBartersText}>
                  edit
                </Text>

          </Pressable>
        )}
      </View>

      {Boolean(post.creatorId?.username) && (
        <Pressable
          onPress={() => router.push(`/profile/${post.creatorId._id}`)}
        >
          <Text style={styles.username}>@{post.creatorId.username}</Text>
        </Pressable>
      )}

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.description}>{post.description}</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statsGridRow}>
          <View style={styles.statItem}>
            <Text style={styles.label}>DEADLINE</Text>
            <Text style={styles.value}>{formatDeadline(post.deadline)}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.label}>STATUS</Text>
            <Text style={styles.value}>{post.status}</Text>
          </View>
        </View>

        <View style={styles.statsGridRow}>
          <View style={styles.statItem}>
            <Text style={styles.label}>MATCHES</Text>
            <Text style={styles.value}>{acceptedCount} / {post.maxMatches}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.label}>BARTERS</Text>
            <Text style={styles.value}>{acceptedCount} accepted</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        {isCreator && (
          <>
            <Text style={styles.barterCount}>
              {barterCount} total | {pendingCount} pending | {acceptedCount} accepted | {rejectedCount} rejected
            </Text>

            <Pressable
              style={styles.viewBartersButton}
              onPress={() => setIsBartersModalVisible(true)}
            >
              <Text style={styles.viewBartersText}>
                View Barters
              </Text>
            </Pressable>
          </>

        )}

        {!isCreator && (
          <View style={styles.barterButtonsRow}>
            <Pressable
              style={[
                styles.viewBartersButton,
                styles.barterButton,
                post.status === "closed" && styles.viewBartersButtonDisabled,
              ]}
              onPress={openProposeModal}
              disabled={post.status === "closed"}
            >
              <Text style={styles.viewBartersText}>Propose Barter</Text>
            </Pressable>

            <Pressable
              style={[
                styles.viewBartersButton,
                styles.barterButton,
              ]}
              onPress={openMyBartersModal}
            >
              <Text style={styles.viewBartersText}>View Sent Barters</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.columnsRow}>
        <View style={[styles.section, styles.column]}>
          <Text style={styles.sectionHeader}>Requests</Text>

          {requests.map(renderResponseRow)}
        </View>

        <View style={[styles.section, styles.column]}>
          <Text style={styles.sectionHeader}>Offers</Text>

          {offers.map(renderResponseRow)}
        </View>
      </View>

      <Modal visible={isProposeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionHeader}>Propose a Barter</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="What are you offering?"
              value={offerInput}
              onChangeText={setOfferInput}
            />

            <Pressable
              style={styles.viewBartersButton}
              onPress={() => {
                setIsProposeModalVisible(false);
                setOfferInput("");
              }}
            >
              <Text style={styles.viewBartersText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.viewBartersButton} onPress={handleSubmitProposal}>
              <Text style={styles.viewBartersText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={isBartersModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.bartersModalContent]}>
            <Text style={styles.sectionHeader}>BARTERS</Text>

            <ScrollView
              style={styles.bartersList}
              contentContainerStyle={styles.bartersListContent}
            >
            {(() => {
              const modalBarters = barters;

              const pendingBarters = modalBarters.filter(
                (barter) => barter.status === "pending"
              );
              const acceptedBarters = modalBarters.filter(
                (barter) => barter.status === "accepted"
              );
              const rejectedBarters = modalBarters.filter(
                (barter) => barter.status === "rejected"
              );

              const renderBarterRow = (barter, statusContent, leadingActions) => {
                const isParticipant =
                  isCreator ||
                  String(barter.creatorId?._id || barter.creatorId) ===
                    String(currentUserId);

                const chatButton = isParticipant && (
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => {
                      router.push(
                        `/chat/${barter._id}?username=${encodeURIComponent(
                          barter.creatorId?.username || ""
                        )}`
                      );
                      setIsBartersModalVisible(false);
                    }}
                  >
                    <Text style={styles.viewBartersText}>Chat</Text>
                  </Pressable>
                );

                return (
                  <View key={barter._id} style={styles.responseRow}>
                    {Boolean(barter.creatorId?.username) && (
                      <Text style={styles.username}>
                        @{barter.creatorId.username}
                      </Text>
                    )}
                    <Text style={styles.value}>{barter.message}</Text>

                    {statusContent}

                    {Boolean(leadingActions || chatButton) && (
                      <View style={styles.barterActionsRow}>
                        {leadingActions}
                        {chatButton}
                      </View>
                    )}
                  </View>
                );
              };

              return (
                <>
                  <View style={styles.section}>
                    <Text style={styles.barterSectionHeading}>PENDING</Text>
                    <View style={styles.barterSectionDivider} />

                    {pendingBarters.length > 0 ? (
                      pendingBarters.map((barter) =>
                        renderBarterRow(
                          barter,
                          null,
                          <>
                            <Pressable
                              style={[styles.actionButton, styles.acceptButton]}
                              onPress={() => handleAcceptBarter(barter._id)}
                            >
                              <Text style={styles.viewBartersText}>Accept</Text>
                            </Pressable>

                            <Pressable
                              style={[styles.actionButton, styles.rejectButton]}
                              onPress={() => handleRejectBarter(barter._id)}
                            >
                              <Text style={styles.viewBartersText}>Reject</Text>
                            </Pressable>
                          </>
                        )
                      )
                    ) : (
                      <Text style={styles.barterEmptyText}>No pending barters</Text>
                    )}
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.barterSectionHeading}>ACCEPTED</Text>
                    <View style={styles.barterSectionDivider} />

                    {acceptedBarters.length > 0 ? (
                      acceptedBarters.map((barter) => renderBarterRow(barter))
                    ) : (
                      <Text style={styles.barterEmptyText}>No accepted barters</Text>
                    )}
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.barterSectionHeading}>REJECTED</Text>
                    <View style={styles.barterSectionDivider} />

                    {rejectedBarters.length > 0 ? (
                      rejectedBarters.map((barter) => renderBarterRow(barter))
                    ) : (
                      <Text style={styles.barterEmptyText}>No rejected barters</Text>
                    )}
                  </View>
                </>
              );
            })()}
            </ScrollView>

            <Pressable
              style={styles.viewBartersButton}
              onPress={() => setIsBartersModalVisible(false)}
            >
              <Text style={styles.viewBartersText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={isMyBartersModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.myBartersModalContent]}>
            <Text style={styles.sectionHeader}>My Barters</Text>

            <ScrollView
              style={styles.myBartersList}
              contentContainerStyle={styles.myBartersListContent}
            >
              {myBartersLoading && (
                <ActivityIndicator size="large" color={Colors.primary} />
              )}

              {!myBartersLoading && myBartersError && (
                <Text style={styles.value}>{myBartersError}</Text>
              )}

              {!myBartersLoading && !myBartersError && myBarters.length === 0 && (
                <Text style={styles.value}>
                  You haven't proposed any barters for this post yet.
                </Text>
              )}

              {!myBartersLoading && !myBartersError && myBarters.map((barter) => (
                <View key={barter._id} style={styles.responseRow}>
                  {barter.status === "accepted" && (
                    <Text style={styles.statusAccepted}>STATUS: Accepted</Text>
                  )}

                  {barter.status === "rejected" && (
                    <Text style={styles.statusRejected}>STATUS: Rejected</Text>
                  )}

                  {barter.status === "pending" && (
                    <Text style={styles.statusPending}>STATUS: Pending</Text>
                  )}

                  <Text style={styles.value}>{barter.message}</Text>

                  {barter.status !== "rejected" && (
                    <Pressable
                      style={styles.viewBartersButton}
                      onPress={() => {
                        router.push(
                          `/chat/${barter._id}?username=${encodeURIComponent(
                            post.creatorId?.username || ""
                          )}`
                        );
                        setIsMyBartersModalVisible(false);
                      }}
                    >
                      <Text style={styles.viewBartersText}>Chat</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </ScrollView>

            <Pressable
              style={styles.viewBartersButton}
              onPress={closeMyBartersModal}
            >
              <Text style={styles.viewBartersText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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

  editButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  username: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.textPrimary,
  },

  description: {
    fontSize: 16,
    marginBottom: 20,
    color: Colors.textBody,
  },

  section: {
    marginBottom: 12,
  },

  statsGrid: {
    rowGap: 12,
    marginBottom: 16,
  },

  statsGridRow: {
    flexDirection: "row",
    columnGap: 20,
  },

  statItem: {
    flex: 1,
  },

  barterButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },

  barterButton: {
    // flex: 1,
  },

  columnsRow: {
    flexDirection: "row",
    gap: 12,
  },

  column: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textSecondary,
  },

  value: {
    fontSize: 14,
    color: Colors.textBody,
  },

  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 6,
    color: Colors.textPrimary,
  },

  responseRow: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  responseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  responseCategory: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  barterCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  viewBartersButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  viewBartersButtonDisabled: {
    backgroundColor: Colors.primaryLight,
  },

  viewBartersText: {
    color: Colors.surface,
    fontSize: 13,
    fontWeight: "600",
  },

  barterSectionHeading: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.4,
    marginBottom: 6,
    color: Colors.textBody,
  },

  barterSectionDivider: {
    height: 1,
    marginBottom: 10,
    backgroundColor: Colors.border,
  },

  barterEmptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: "italic",
    marginBottom: 8,
  },

  barterActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },

  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  acceptButton: {
    backgroundColor: BARTER_ACCEPT_COLOR,
  },

  rejectButton: {
    backgroundColor: BARTER_REJECT_COLOR,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
  },

  myBartersModalContent: {
    maxHeight: "80%",
  },

  myBartersList: {
    flexGrow: 0,
    flexShrink: 1,
  },

  myBartersListContent: {
    paddingBottom: 4,
  },

  bartersModalContent: {
    maxHeight: "80%",
  },

  bartersList: {
    flexGrow: 0,
    flexShrink: 1,
  },

  bartersListContent: {
    paddingBottom: 4,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    padding: 8,
    marginVertical: 12,
    backgroundColor: Colors.surface,
  },

  statusAccepted: {
    fontSize: 13,
    fontWeight: "600",
    color: BARTER_ACCEPT_COLOR,
    marginBottom: 4,
  },

  statusRejected: {
    fontSize: 13,
    fontWeight: "600",
    color: BARTER_REJECT_COLOR,
    marginBottom: 4,
  },

  statusPending: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textBody,
    marginBottom: 4,
  },
});
