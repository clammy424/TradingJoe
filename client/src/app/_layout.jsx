import { useEffect, useState } from "react";
import { router, usePathname, useSegments } from "expo-router";
import { Stack } from "expo-router/stack";
import { getToken } from "../services/auth";


// SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [token, setToken] = useState(null);
  const pathname = usePathname();
  const segments = useSegments();
  const firstSegment = segments[0];

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

  return (
    <Stack/>
  );
}
