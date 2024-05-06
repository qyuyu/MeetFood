import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "react-native";
import { Amplify, ResourcesConfig } from "aws-amplify";
import amplifyconfig from "../amplifyconfiguration.json";
import { colors } from "../constants";

Amplify.configure(amplifyconfig as ResourcesConfig);

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen
        name="video/[id]"
        options={{
          href: null,
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
          unmountOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
          headerStyle: {
            backgroundColor: colors.mainBg,
          },
          tabBarLabel: ({ focused }) => (
            <Text
              style={{ color: focused ? colors.mainText : colors.secondText }}
            >
              Home
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="home"
              size={20}
              color={focused ? colors.mainText : colors.secondText}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="createContent"
        options={{
          title: "CREATE VIDEO",
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
          tabBarButton: (props) => (
            <View style={{ justifyContent: "center" }}>
              <FontAwesome.Button
                onPress={props.onPress}
                onBlur={props.onBlur}
                size={20}
                name="plus"
                style={{
                  paddingRight: 0,
                  backgroundColor: colors.primary,
                  width: 45,
                  flexDirection: "column",
                }}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="userProfile"
        options={{
          title: "Me",
          headerStyle: {
            backgroundColor: colors.mainBg,
          },
          tabBarLabel: ({ focused }) => (
            <Text
              style={{ color: focused ? colors.mainText : colors.secondText }}
            >
              Me
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="user-circle-o"
              size={18}
              color={focused ? colors.mainText : colors.secondText}
            />
          ),
        }}
      />
    </Tabs>
  );
}
