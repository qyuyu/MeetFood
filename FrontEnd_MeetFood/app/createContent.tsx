import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { AuthGuard } from "../components/AuthGuard";
import { CreateContentScreen } from "../components/CreateContentScreen";

export default function App() {
  return (
    <AuthGuard>
      <CreateContentScreen />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
