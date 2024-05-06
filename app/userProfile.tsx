import { Button, StyleSheet, Text, View } from "react-native";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import { AuthGuard } from "../components/AuthGuard";

const UserProfileScreen = () => {
  const { signOut, user } = useAuthenticator();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text>Email: {user?.username}</Text>
      <Button title="sign Out" onPress={signOut}></Button>
    </View>
  );
};

export default function App() {
  return (
    <AuthGuard>
      <UserProfileScreen />
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
