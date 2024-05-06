import { FC, useEffect, useRef } from "react";
import { Animated, useWindowDimensions } from "react-native";
import { colors } from "../../constants";

interface CountdownProgressBarProps {
  duration: number;
}
export const CountdownProgressBar: FC<CountdownProgressBarProps> = ({
  duration,
}) => {
  const { width } = useWindowDimensions();

  const animatedWidth = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    }).start();
  }, [animatedWidth]);

  return (
    <Animated.View // Special animatable View
      style={{
        alignSelf: "flex-start",
        width: animatedWidth, // Bind width to animated value
        borderTopWidth: 2,
        borderTopColor: colors.primary,
      }}
    />
  );
};
