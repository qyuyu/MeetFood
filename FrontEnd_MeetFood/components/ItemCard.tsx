import { View, Image, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "expo-router";
import { ScreenNavigationProps } from "../type";

export interface ItemCardProps {
  imgSource: string;
  dishTitle: string;
  restaurantName: string;
  id: string;
}

export const ItemCard = ({
  imgSource,
  dishTitle,
  restaurantName,
  id,
}: ItemCardProps) => {
  const navigation = useNavigation<ScreenNavigationProps>();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          navigation.navigate("video/[id]", { id });
        }}
      >
        <Image
          source={{
            uri: imgSource,
          }}
          height={250}
          style={styles.img}
        />
        <View style={styles.textContainer}>
          <Text style={styles.dishTitle}>{dishTitle}</Text>
          <Text style={styles.restaurantTitle}>{restaurantName}</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexBasis: "46%",
    marginBottom: 15,
    marginHorizontal: "2%",
  },
  img: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  textContainer: {
    backgroundColor: "#fff",
    paddingBottom: 10,
    paddingHorizontal: 6,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  dishTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
    marginBottom: 8,
  },
  restaurantTitle: {
    fontWeight: "500",
  },
});
