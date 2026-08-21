import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { healthCheck } from "../../services/api";

export default function TestScreen() {
  const [message, setMessage] = useState("Connecting...");

  useEffect(() => {
    const testBackend = async () => {
      try {
        const data = await healthCheck();
        console.log("BACKEND RESPONSE:", data);
        setMessage(data.message);
      } catch (error) {
        console.error("BACKEND ERROR:", error);
        setMessage(`Failed: ${error.message}`);
      }
    };

    testBackend();
  }, []);

  return (
    <View>
      <Text>{message}</Text>
    </View>
  );
}