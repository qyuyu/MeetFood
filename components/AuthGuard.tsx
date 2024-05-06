import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react-native";
import { AuthenticatorRoute } from "@aws-amplify/ui";
import { Children, ReactNode, useEffect, useState } from "react";
import { BASE_URL } from "../utils";
import axios from "axios";

export interface CustomizedAuthenticatorProps {
  children: ReactNode;
}

type AuthGuardProps = CustomizedAuthenticatorProps;

export const CustomizedAuthenticator = ({
  children,
}: CustomizedAuthenticatorProps) => {
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
      {children}
    </Authenticator>
  );
};

export const AuthGuard = ({ children }: AuthGuardProps) => {
  return (
    <Authenticator.Provider>
      <CustomizedAuthenticator>{children}</CustomizedAuthenticator>
    </Authenticator.Provider>
  );
};
