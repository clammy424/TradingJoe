import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { router, usePathname, useSegments } from "expo-router";
import { Stack } from "expo-router/stack";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { getToken } from "../services/auth";
import { Colors, Spacing, Radius, FontFamily } from "../constants/tokens";

function HomeButton() {
  return (
    <Pressable
      onPress={() => router.replace("/explore")}
      hitSlop={8}
      style={({ pressed }) => [
        styles.homeButton,
        pressed && styles.homeButtonPressed,
      ]}
    >
      <View style={styles.homeButtonDot} />
      <Text style={styles.homeButtonText}>Home</Text>
    </Pressable>
  );
}


// SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [token, setToken] = useState(null);
  const pathname = usePathname();
  const segments = useSegments();
  const firstSegment = segments[0];

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const storedToken = await getToken();

      if (!isMounted) {
        return;
      }

      setToken(storedToken);
      setIsCheckingAuth(false);
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, firstSegment]);

  useEffect(() => {
    if (isCheckingAuth) {
      return;
    }

    const isAuthRoute = firstSegment === "auth";
    const isPublicRoute = isAuthRoute;

    if (!token && !isPublicRoute) {
      router.replace("/auth/login");
    }

    if (token && isAuthRoute) {
      router.replace("/explore");
    }
  }, [isCheckingAuth, token, pathname, firstSegment]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const showHomeButton = Boolean(token) && firstSegment !== "auth";

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: Colors.background },
        title: "",
        headerShadowVisible: false,
        headerTintColor: Colors.textPrimary,
        headerStyle: { backgroundColor: Colors.surface },
        headerBackButtonDisplayMode: "minimal",
        headerRight: showHomeButton ? () => <HomeButton /> : undefined,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="explore" options={{ headerShown: false }} />
      <Stack.Screen name="post/[postId]" options={{ headerShown: false }} />
      <Stack.Screen name="post/create-post" options={{ headerShown: false }} />
      <Stack.Screen name="profile/[userId]" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    marginRight: Spacing.xs,
  },
  homeButtonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  homeButtonDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
  },
  homeButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: Colors.surface,
  },
});
