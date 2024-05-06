import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { ItemList } from "../components/ItemList";
import { colors } from "../constants";

export default function App() {
  return (
    <View style={styles.container}>
      <ItemList />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mainBg,
    alignItems: "center",
    justifyContent: "center",
  },
});
