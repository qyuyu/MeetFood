import { NavigationProp } from "@react-navigation/native";

type RootStackParamList = {
  index: undefined;
  createContent: undefined;
  userProfile: undefined;
  "video/[id]": { id: string };
};

export type ScreenNavigationProps = NavigationProp<RootStackParamList>;
