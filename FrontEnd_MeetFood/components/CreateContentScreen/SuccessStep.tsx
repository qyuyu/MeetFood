import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants";
import { CreateContentScreenStep, ScreenNavigationProps } from "../../type";
import { FC } from "react";

interface SuccessStepProps {
  setStep: (newStep: CreateContentScreenStep) => void;
  setVideoUri: (uri: string) => void;
}

export const SuccessStep: FC<SuccessStepProps> = ({ setStep, setVideoUri }) => {
  const navigation = useNavigation<ScreenNavigationProps>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Success Step</Text>
      </View>
      <Text style={{ fontSize: 18 }}>
        You have successfully published a video post!
      </Text>
      <View style={styles.btnContainer}>
        <Pressable
          style={styles.createMorePostsBtn}
          onPress={() => {
            setStep(CreateContentScreenStep.Record);
            setVideoUri("");
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18 }}>Create More Posts</Text>
        </Pressable>
        <Button
          title="Return to Home"
          onPress={() => {
            navigation.navigate("index");
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.mainBg,
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 9,
  },
  headerContainer: {
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "500",
  },
  btnContainer: {
    width: "100%",
    alignItems: "center",
  },
  createMorePostsBtn: {
    backgroundColor: colors.primary,
    padding: 12,
    width: "100%",
    alignItems: "center",
    borderRadius: 20,
  },
});
