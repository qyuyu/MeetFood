import { Button, StyleSheet, Text, View } from "react-native";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react-native";
import { useEffect, useState } from "react";
import { AuthenticatorRoute } from "@aws-amplify/ui";
import axios from "axios";
import { BASE_URL } from "../utils";

const MyAppHeader = () => {
  return <Text>My Header</Text>;
};

const AfterAuth = () => {
  const { signOut, user } = useAuthenticator();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text>Email: {user?.username}</Text>
      <Button title="sign Out" onPress={signOut}></Button>
    </View>
  );
};

const AuthScreen = () => {
  const { route, user } = useAuthenticator((context) => [context.route]);
  const [prevRoute, setPrevRoute] = useState<AuthenticatorRoute>("idle");

  useEffect(() => {
    // user complete sign up
    if (prevRoute === "transition" && route === "authenticated") {
      const accessToken = user?.signInDetails?.loginId;
      axios.post(
        `${BASE_URL}/api/v1/user/new`,
        {
          email: user.username,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "cognito-token": accessToken,
          },
        }
      );
    }
    setPrevRoute(route);
  }, [route]);

  return (
    <Authenticator
      // will wrap every subcomponent
      Container={(props) => (
        // reuse default `Container` and apply custom background
        <Authenticator.Container
          {...props}
          style={{ backgroundColor: "red" }}
        />
      )}
      // will render on every subcomponent
      Header={MyAppHeader}
      components={{
        SignIn: ({ fields, ...props }) => {
          const customizedFields = [...fields];
          customizedFields[0] = {
            name: "username",
            label: "Email",
            placeholder: "Enter your email address",
            required: true,
            type: "email",
          };
          return <Authenticator.SignIn {...props} fields={customizedFields} />;
        },
        SignUp: ({ fields, ...props }) => {
          const customizedFields = [...fields];
          customizedFields[0] = {
            name: "username",
            label: "Email",
            placeholder: "Enter your email address",
            required: true,
            type: "email",
          };
          return <Authenticator.SignUp {...props} fields={customizedFields} />;
        },
      }}
    >
      <AfterAuth />
    </Authenticator>
  );
};
export default function App() {
  return (
    <Authenticator.Provider>
      <AuthScreen />
    </Authenticator.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
