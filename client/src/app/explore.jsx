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

import { getPosts } from "../services/api";
import { removeToken } from "../services/auth";
import { getCurrentUserId } from "../services/auth";

import PostCard from "./post/PostCard";


export default function Explore() {

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [currentUserId, setCurrentUserId] = useState(null);

  const [error, setError] = useState(null);
  
    useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      getCurrentUserId().then((userId) => {
        if (isMounted) {
          setCurrentUserId(userId);
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


  return (

    <View style={styles.container}>


      {/* TOP HEADER */}

      <View style={styles.headerRow}>

        <Text style={styles.header}>
          Welcome, Trader
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
    backgroundColor: "#000",
  },


  createButtonText: {
    color: "#fff",
    fontWeight: "600",
  },


  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },


  logoutButtonText: {
    fontWeight: "600",
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
  },


  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },

});