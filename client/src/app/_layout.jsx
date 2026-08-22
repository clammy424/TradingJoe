import { useEffect } from "react";
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
import { AuthProvider, useAuth } from "../context/AuthContext";
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

function RootLayoutNav() {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const pathname = usePathname();
  const segments = useSegments();
  const firstSegment = segments[0];

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  // "/auth/*" is the only public route. The root ("/") is never rendered as
  // a destination in its own right — it always forwards to whichever of
  // "/explore" or "/auth/login" matches the current auth state.
  const isAuthRoute = firstSegment === "auth";
  const isRootRoute = firstSegment === undefined;
  const isPublicRoute = isAuthRoute;

  useEffect(() => {
    if (isCheckingAuth) {
      return;
    }

    if (isRootRoute) {
      router.replace(isAuthenticated ? "/explore" : "/auth/login");
      return;
    }

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/auth/login");
      return;
    }

    if (isAuthenticated && isAuthRoute) {
      router.replace("/explore");
    }
  }, [isCheckingAuth, isAuthenticated, isAuthRoute, isRootRoute, isPublicRoute, pathname]);

  // While auth status is unknown, or once we know the current route is about
  // to be redirected away from (root, or a protected route with no token),
  // never mount the destination screen — show the loading state instead so
  // nothing behind the guard is ever visible, even for a frame.
  const isBlocked =
    !isCheckingAuth && (isRootRoute || (!isAuthenticated && !isPublicRoute));

  if (!fontsLoaded || isCheckingAuth || isBlocked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const showHomeButton = isAuthenticated && firstSegment !== "auth";

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
      <Stack.Screen name="chat/[barterId]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
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
