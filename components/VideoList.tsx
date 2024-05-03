import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoPlayer } from "./VideoPlayer";
import { ScrollView, useWindowDimensions } from "react-native";

export const VideoList = () => {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const videoHeight = height - insets.bottom - insets.top;

  return (
    <ScrollView
      style={{ width: "100%" }}
      contentContainerStyle={{ width: "100%" }}
      snapToInterval={videoHeight}
      decelerationRate="fast"
    >
      <VideoPlayer />
      <VideoPlayer />
      <VideoPlayer />
      <VideoPlayer />
    </ScrollView>
  );
};
