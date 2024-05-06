import { FlatList, RefreshControl, StyleSheet } from "react-native";
import { ItemCard } from "./ItemCard";
import axios from "axios";
import { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BASE_URL } from "../utils";
import { VideoItemsListAtom } from "../atom";
import { useAtom } from "jotai";
import { VideoPostItem } from "../type";

export const ItemList = () => {
  const [itemsData, setItemsData] = useAtom(VideoItemsListAtom);
  const [loading, setLoading] = useState(false);

  const fetchVideoPost = () => {
    setLoading(true);
    axios
      .get<VideoPostItem[]>(`${BASE_URL}/api/v1/video/videos?size=50`)
      .then((result) => {
        setItemsData(result.data);
      })
      .finally(() => {
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    fetchVideoPost();
  }, []);

  if (loading) {
    return <FontAwesome name="spinner" size={60} />;
  }

  return (
    <FlatList
      data={itemsData}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchVideoPost} />
      }
      renderItem={({ item, index }) => (
        <ItemCard
          key={index}
          imgSource={item.coverImageUrl}
          dishTitle={item.postTitle}
          restaurantName={item.restaurantName}
          id={item._id}
        />
      )}
      numColumns={2}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  contentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
});
