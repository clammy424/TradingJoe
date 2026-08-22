import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable
} from "react-native";

import {
  useCallback,
  useState
} from "react";

import { router, useFocusEffect } from "expo-router";

import { getPosts, getUserProfile } from "../services/api";
import { removeToken } from "../services/auth";
import { getCurrentUserId } from "../services/auth";

import PostCard from "./post/PostCard";
import { Colors } from "../constants/tokens";


export default function Explore() {

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [currentUserId, setCurrentUserId] = useState(null);

  const [currentUserName, setCurrentUserName] = useState("");

  const [error, setError] = useState(null);

    useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      getCurrentUserId().then(async (userId) => {
        if (isMounted) {
          setCurrentUserId(userId);
        }

        if (userId) {
          try {
            const profile = await getUserProfile(userId);

            if (isMounted) {
              setCurrentUserName(profile.name || "");
            }
          } catch (error) {
            console.error(error);
          }
        }
      });

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const fetchPosts = useCallback(async () => {

    try {

      setLoading(true);

      const data = await getPosts();

      setPosts(data);

    } catch (error) {

      console.error(error);

      setError("Failed to load posts");

    } finally {

      setLoading(false);

    }

  }, []);


  const handleLogout = async () => {

    try {

      await removeToken();

      router.replace("/auth/login");

    } catch (error) {

      console.error("LOGOUT ERROR:", error);

    }

  };


  useFocusEffect(

    useCallback(() => {

      fetchPosts();

    }, [fetchPosts])

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


  return (

    <View style={styles.container}>


      {/* TOP HEADER */}

      <View style={styles.headerRow}>

        <Text style={styles.header}>
          Welcome, Trader{currentUserName ? ` ${currentUserName}` : ""}
        </Text>


        <View style={styles.headerButtons}>


          <Pressable
            style={styles.createButton}
            onPress={() =>
              router.push("/post/create-post")
            }
          >

            <Text style={styles.createButtonText}>
              + Create
            </Text>

          </Pressable>

          {Boolean(currentUserId) && (
            <Pressable 
              style={styles.createButton}
              onPress={() => router.push(`/profile/${currentUserId}`)}>
              
              <Text style={styles.createButtonText}>
                View Profile
              </Text>
              
            </Pressable>
          )}

          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
          >

            <Text style={styles.logoutButtonText}>
              Logout
            </Text>

          </Pressable>



        </View>

      </View>


      {/* FEED */}

      <FlatList

        style={styles.feed}

        data={posts}

        keyExtractor={(item) => item._id}

        renderItem={({ item }) => (

          <PostCard

            post={item}

            onPress={() =>
              router.push(`/post/${item._id}?from=explore`)
            }

          />

        )}

        ListEmptyComponent={

          <View style={styles.emptyContainer}>

            <Text>
              No posts yet.
            </Text>

          </View>

        }

        contentContainerStyle={styles.feedContent}

      />

    </View>

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },


  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },


  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },


  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },


  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },


  createButtonText: {
    color: Colors.surface,
    fontWeight: "600",
  },


  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },


  logoutButtonText: {
    fontWeight: "600",
    color: Colors.textBody,
  },


  feed: {
    flex: 1,
  },


  feedContent: {
    paddingBottom: 30,
  },


  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },


  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },

});