import { Camera, CameraType } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { FC, useRef, useState } from "react";
import {
  Button,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../../constants";
import { CreateContentScreenStep, ScreenNavigationProps } from "../../type";
import { CountdownProgressBar } from "./CountdownProgressBar";

const RECORD_BTN_SIZE = 60;
const DURATION_IN_MS = 10000;
const DURATION_IN_S = 10000 / 1000;

interface RecordStepProps {
  setStep: (newStep: CreateContentScreenStep) => void;
  setVideoUri: (uri: string) => void;
}

export const RecordStep: FC<RecordStepProps> = ({ setStep, setVideoUri }) => {
  const camRef = useRef<Camera>(null);
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const [isRecording, setIsRecording] = useState(false);
  const navigation = useNavigation<ScreenNavigationProps>();

  const pickVideo = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });

    console.log(result);

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
      setStep(CreateContentScreenStep.Review);
    }
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Camera style={styles.camera} type={type} ref={camRef} />
      {isRecording && (
        <SafeAreaView style={styles.progressBarContainer}>
          <CountdownProgressBar
            duration={
              // https://github.com/expo/expo/issues/1057. Add additional 1500ms for iOS because of flickers
              Platform.OS === "ios" ? DURATION_IN_MS + 1500 : DURATION_IN_MS
            }
          />
        </SafeAreaView>
      )}
      {!isRecording && (
        <SafeAreaView style={styles.exitBtnContainer}>
          <FontAwesome.Button
            name="close"
            backgroundColor="transparent"
            color="#fff"
            size={30}
            onPress={() => {
              navigation.navigate("index");
            }}
          />
        </SafeAreaView>
      )}
      <View style={styles.cameraControlContainer}>
        <MaterialIcons.Button
          name="video-collection"
          size={40}
          color="#fff"
          backgroundColor="transparent"
          onPress={pickVideo}
        />
        <Pressable
          style={{
            ...styles.recordBtnContainer,
            padding: isRecording ? 12 : 3,
          }}
          onPress={() => {
            if (!isRecording) {
              setIsRecording(true);
              camRef.current
                ?.recordAsync({
                  maxDuration: DURATION_IN_S,
                })
                .then((output) => {
                  setVideoUri(output.uri);
                  setIsRecording(false);
                  setStep(CreateContentScreenStep.Review);
                });
            } else {
              camRef.current?.stopRecording();
              setIsRecording(false);
            }
          }}
        >
          <View
            style={{
              ...styles.recordBtn,
              borderRadius: isRecording ? 9 : RECORD_BTN_SIZE,
            }}
          />
        </Pressable>
        <MaterialIcons.Button
          name="flip-camera-ios"
          size={40}
          color="#fff"
          backgroundColor="transparent"
          onPress={toggleCameraType}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  camera: {
    height: "90%",
    width: "100%",
  },
  progressBarContainer: {
    position: "absolute",
    top: 0,
  },
  exitBtnContainer: {
    position: "absolute",
    top: 0,
  },
  cameraControlContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  recordBtnContainer: {
    height: RECORD_BTN_SIZE,
    width: RECORD_BTN_SIZE,
    borderRadius: RECORD_BTN_SIZE,
    borderWidth: 3,
    borderColor: "#fff",
  },
  recordBtn: {
    backgroundColor: colors.primary,
    flex: 1,
  },
});
