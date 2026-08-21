import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "authToken";

const decodeBase64Url = (value) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  let output = "";
  let buffer = 0;
  let bits = 0;

  for (const char of base64) {
    if (char === "=") {
      break;
    }

    const index = alphabet.indexOf(char);

    if (index === -1) {
      throw new Error("Invalid token");
    }

    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 255);
    }
  }

  return output;
};

const isExpiredToken = (token) => {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return true;
    }

    const payload = JSON.parse(decodeBase64Url(parts[1]));

    if (!payload.exp) {
      return true;
    }

    return payload.exp * 1000 <= Date.now();
  } catch (error) {
    return true;
  }
};

export const saveToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  if (token && isExpiredToken(token)) {
    await removeToken();
    return null;
  }

  return token;
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const getCurrentUserId = async () => {
  const token = await getToken();

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(token.split(".")[1]));
    return payload.userID || null;
  } catch (error) {
    return null;
  }
};
