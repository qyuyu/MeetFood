import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { VideoList } from "../../components/VideoList";

export default function App() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <VideoList initialVideoId={id as string} />
    </SafeAreaView>
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
