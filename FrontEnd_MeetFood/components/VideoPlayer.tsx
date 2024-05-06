import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { Video, ResizeMode, AVPlaybackStatusSuccess } from "expo-av";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { ScreenNavigationProps } from "../type";

interface VideoPlayerProps {
  videoUrl: string;
  dishTitle: string;
  restaurantName: string;
  videoHeight: number;
  activeVideoIndex: number;
  selfVideoIndex: number;
  posterUrl: string;
}

export const VideoPlayer = ({
  videoUrl,
  dishTitle,
  restaurantName,
  videoHeight,
  activeVideoIndex,
  selfVideoIndex,
  posterUrl,
}: VideoPlayerProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ScreenNavigationProps>();
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<Partial<AVPlaybackStatusSuccess>>({});

  const toggleVideoPlay = () => {
    if (video.current) {
      status.isPlaying
        ? video.current.pauseAsync()
        : video.current.pauseAsync();
    }
  };

  useEffect(() => {
    if (selfVideoIndex === activeVideoIndex) {
      video.current?.playAsync();
    } else {
      video.current?.pauseAsync();
    }
  }, [activeVideoIndex]);
  return (
    <View style={{ ...styles.container, height: videoHeight }}>
      <Video
        ref={video}
        style={styles.video}
        posterSource={{ uri: posterUrl }}
        posterStyle={{ height: videoHeight }}
        source={{
          uri: videoUrl,
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
        <Text style={styles.dishTitle}>{dishTitle}</Text>
        <Text style={styles.restaurantName}>{restaurantName}</Text>
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
