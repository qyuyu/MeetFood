import { useRef, useState } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { Video, ResizeMode, AVPlaybackStatusSuccess } from "expo-av";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { ScreenNavigationProps } from "../type";
import { useWindowDimensions } from "react-native";

export const VideoPlayer = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ScreenNavigationProps>();
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<Partial<AVPlaybackStatusSuccess>>({});
  const { height, width } = useWindowDimensions();
  const videoHeight = height - insets.top - insets.bottom;
  const videoWidth = width - insets.left - insets.right;

  const toggleVideoPlay = () => {
    if (video.current) {
      status.isPlaying
        ? video.current.pauseAsync()
        : video.current.pauseAsync();
    }
  };

  return (
    <View
      style={{ ...styles.container, height: videoHeight, width: videoWidth }}
    >
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
        }}
        resizeMode={ResizeMode.STRETCH}
        isLooping
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded) {
            setStatus(status);
          }
        }}
      />
      <View
        style={{
          ...styles.controlContainer,
          left: insets.left,
        }}
      >
        <FontAwesome.Button
          name="arrow-left"
          size={26}
          onPress={() => {
            navigation.navigate("index");
            video.current?.pauseAsync();
          }}
          backgroundColor="transparent"
          color="grey"
          style={{ padding: 20 }}
        />
      </View>

      <View
        style={{
          ...styles.controlContainer,
          justifyContent: "center",
          alignContent: "center",
          height: "100%",
          width: "100%",
        }}
      >
        {
          // conditional rendering
          status.isPlaying ? null : (
            <FontAwesome.Button
              name="play-circle"
              size={50}
              onTouchEnd={toggleVideoPlay}
              backgroundColor="transparent"
              color="grey"
            />
          )
        }
      </View>
      <View
        style={{
          ...styles.controlContainer,
          bottom: insets.bottom,
          paddingBottom: 20,
          paddingLeft: 12,
        }}
      >
        <Text style={styles.dishTitle}>Fried Noodle</Text>
        <Text style={styles.restaurantName}>Chefus</Text>
      </View>
      <View
        style={{
          ...styles.controlContainer,
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignContent: "center",
          padding: 50,
        }}
      >
        <Pressable
          onPress={toggleVideoPlay}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  controlContainer: {
    position: "absolute",
    pointerEvents: "box-none",
  },
  restaurantName: {
    color: "#fff",
  },
  dishTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "500",
  },
});
