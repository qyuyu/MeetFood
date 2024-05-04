import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FlatList,
  useWindowDimensions,
  ViewabilityConfigCallbackPairs,
  Image,
} from "react-native";
import { useAtomValue } from "jotai";
import { VideoPlayer } from "./VideoPlayer";
import { VideoItemsListAtom } from "../atom";
import { useState, useRef } from "react";

interface VideoListProps {
  initialVideoId: string;
}

export const VideoList = ({ initialVideoId }: VideoListProps) => {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const videoHeight = height - insets.bottom - insets.top;
  const videoItemsList = useAtomValue(VideoItemsListAtom);
  const [activeVideoIndex, setActiveVideoIndex] = useState(-1);
  const viewabilityConfigCallbackPairs: ViewabilityConfigCallbackPairs = [
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 90 },
      onViewableItemsChanged: ({ viewableItems }) => {
        if (viewableItems.length) {
          setActiveVideoIndex(viewableItems[0].index as number);
        }
      },
    },
  ];

  const ViewabilityConfigCallbackPairsRef = useRef(
    viewabilityConfigCallbackPairs
  );
  return (
    <FlatList
      style={{ width: "100%" }}
      viewabilityConfigCallbackPairs={ViewabilityConfigCallbackPairsRef.current}
      contentContainerStyle={{ width: "100%" }}
      snapToInterval={videoHeight}
      decelerationRate="fast"
      initialScrollIndex={videoItemsList.findIndex((item) => {
        item._id === initialVideoId;
      })}
      getItemLayout={(data, index) => ({
        length: videoHeight,
        offset: videoHeight * index,
        index,
      })}
      data={videoItemsList}
      renderItem={({ item, index }) => {
        return Math.abs(activeVideoIndex - index) <= 1 ? (
          <VideoPlayer
            key={item._id}
            videoHeight={videoHeight}
            videoUrl={item.videoUrl}
            restaurantName={item.restaurantName}
            dishTitle={item.postTitle}
            activeVideoIndex={activeVideoIndex}
            selfVideoIndex={index}
            posterUrl={item.coverImageUrl}
          />
        ) : (
          <Image source={{ uri: item.coverImageUrl }} height={videoHeight} />
        );
      }}
    />
  );
};
