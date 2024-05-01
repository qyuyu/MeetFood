import { FlatList, StyleSheet } from "react-native";
import { ItemCard } from "./itemCard";
import axios from "axios";
import { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BASE_URL } from "../utils";

interface VideoPostItem {
  _id: string;
  postTitle: string;
  coverImageUrl: string;
  restaurantName: string;
  videoUrl: string;
}
export const ItemList = () => {
  const [itemsData, setItemsData] = useState<VideoPostItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
  }, []);

  if (loading) {
    return <FontAwesome name="spinner" size={60} />;
  }
  return (
    <FlatList
      data={itemsData}
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
