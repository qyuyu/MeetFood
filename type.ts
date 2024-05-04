import { NavigationProp } from "@react-navigation/native";

type RootStackParamList = {
  index: undefined;
  createContent: undefined;
  userProfile: undefined;
  "video/[id]": { id: string };
};

export interface VideoPostItem {
  _id: string;
  postTitle: string;
  coverImageUrl: string;
  restaurantName: string;
  videoUrl: string;
}

export type ScreenNavigationProps = NavigationProp<RootStackParamList>;
