import { View, Text, Pressable, ActivityIndicator, StyleSheet, Modal, TextInput, ScrollView } from "react-native";
import { useCallback, useState } from "react";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";

import { getPostById, createBarter, acceptBarter, rejectBarter, getMyBartersForPost } from "../../services/api";
import { getCurrentUserId } from "../../services/auth";

export default function PostDetail() {
  const { postId } = useLocalSearchParams();

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
        <ActivityIndicator size="large" />
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
    <View key={response._id} style={styles.responseRow}>
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

      {isCreator && (
        <Pressable
              style={styles.viewBartersButton}
              onPress={() =>
                router.push(`/post/create-post?postId=${post._id}`)
              }
            >

              <Text style={styles.viewBartersText}>
                edit
              </Text>

        </Pressable>
      )}
      
      {Boolean(post.creatorId?.username) && (
        <Text style={styles.username}>@{post.creatorId.username}</Text>
      )}

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.description}>{post.description}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>DEADLINE</Text>
        <Text style={styles.value}>{post.deadline}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>MAX MATCHES</Text>
        <Text style={styles.value}>{post.maxMatches}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>STATUS</Text>
        <Text style={styles.value}>{post.status}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>MATCHES</Text>
        <Text style={styles.value}>{acceptedCount} / {post.maxMatches}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>BARTERS</Text>
        
        

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
          <>
            <Text style={styles.barterCount}>
            {acceptedCount} accepted
            </Text>
            <Pressable
              style={[
                styles.viewBartersButton,
                post.status === "closed" && styles.viewBartersButtonDisabled,
              ]}
              onPress={openProposeModal}
              disabled={post.status === "closed"}
            >
              <Text style={styles.viewBartersText}>Propose Barter</Text>
            </Pressable>

            <Pressable
              style={styles.viewBartersButton}
              onPress={openMyBartersModal}
            >
              <Text style={styles.viewBartersText}>View My Barters</Text>
            </Pressable>
          </>

        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Requests</Text>

        {requests.map(renderResponseRow)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Offers</Text>

        {offers.map(renderResponseRow)}
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
            <Text style={styles.sectionHeader}>Barters</Text>

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

              const renderBarterRow = (barter, statusContent) => {
                const isParticipant =
                  isCreator ||
                  String(barter.creatorId?._id || barter.creatorId) ===
                    String(currentUserId);

                return (
                  <View key={barter._id} style={styles.responseRow}>
                    {Boolean(barter.creatorId?.username) && (
                      <Text style={styles.username}>
                        @{barter.creatorId.username}
                      </Text>
                    )}
                    <Text style={styles.value}>{barter.message}</Text>

                    {statusContent}

                    {isParticipant && (
                      <Pressable
                        style={styles.viewBartersButton}
                        onPress={() => {
                          router.push(`/chat/${barter._id}`);
                          setIsBartersModalVisible(false);
                        }}
                      >
                        <Text style={styles.viewBartersText}>Chat</Text>
                      </Pressable>
                    )}
                  </View>
                );
              };

              return (
                <>
                  {pendingBarters.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.label}>PENDING</Text>
                      {pendingBarters.map((barter) =>
                        renderBarterRow(
                          barter,
                          <>
                            <Pressable
                              style={styles.viewBartersButton}
                              onPress={() => handleAcceptBarter(barter._id)}
                            >
                              <Text style={styles.viewBartersText}>Accept</Text>
                            </Pressable>

                            <Pressable
                              style={styles.viewBartersButton}
                              onPress={() => handleRejectBarter(barter._id)}
                            >
                              <Text style={styles.viewBartersText}>Reject</Text>
                            </Pressable>
                          </>
                        )
                      )}
                    </View>
                  )}

                  {acceptedBarters.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.label}>ACCEPTED</Text>
                      {acceptedBarters.map((barter) =>
                        renderBarterRow(
                          barter,
                          <Text style={styles.statusAccepted}>Accepted</Text>
                        )
                      )}
                    </View>
                  )}

                  {rejectedBarters.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.label}>REJECTED</Text>
                      {rejectedBarters.map((barter) =>
                        renderBarterRow(
                          barter,
                          <Text style={styles.statusRejected}>Rejected</Text>
                        )
                      )}
                    </View>
                  )}
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
                <ActivityIndicator size="large" />
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
                  <Text style={styles.value}>{barter.message}</Text>

                  {barter.status === "accepted" && (
                    <Text style={styles.statusAccepted}>Accepted</Text>
                  )}

                  {barter.status === "rejected" && (
                    <Text style={styles.statusRejected}>Rejected</Text>
                  )}

                  {barter.status === "pending" && (
                    <Text style={styles.barterCount}>Pending</Text>
                  )}

                  {barter.status !== "rejected" && (
                    <Pressable
                      style={styles.viewBartersButton}
                      onPress={() => {
                        router.push(`/chat/${barter._id}`);
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
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  username: {
    fontSize: 13,
    color: "#7c3aed",
    fontWeight: "600",
    marginBottom: 4,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },

  description: {
    fontSize: 16,
    marginBottom: 20,
  },

  section: {
    marginBottom: 12,
  },

  label: {
    fontSize: 12,
    fontWeight: "bold",
  },

  value: {
    fontSize: 14,
  },

  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 6,
  },

  responseRow: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },

  barterCount: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  viewBartersButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#7c3aed",
  },

  viewBartersButtonDisabled: {
    backgroundColor: "#c4b5e6",
  },

  viewBartersText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContent: {
    backgroundColor: "#fff",
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
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginVertical: 12,
  },

  statusAccepted: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#16a34a",
  },

  statusRejected: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#dc2626",
  },
});
