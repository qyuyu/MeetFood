import { FC, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import { colors } from "../../constants";
import { CreateContentScreenStep } from "../../type";
import { BASE_URL } from "../../utils";

interface UploadVideoApiResponse {
  videoUrl: string;
}

interface UploadCoverImageApiResponse {
  imageUrl: string;
}

interface PublishStepProps {
  setStep: (newStep: CreateContentScreenStep) => void;
  videoUri: string;
}

export const PublishStep: FC<PublishStepProps> = ({ setStep, videoUri }) => {
  const [postName, setPostName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const { user } = useAuthenticator((context) => [context.user]);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    console.log(result);

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const validate = () => {
    const results: string[] = [];
    if (!postName) {
      results.push("Post name is required");
    }
    if (!restaurantName) {
      results.push("Restaurant name is required");
    }
    if (!imageUri) {
      results.push("Cover image is required");
    }

    return results.join(", ");
  };

  const handlePublish = async () => {
    setErrorMessage("");

    // step 1: form validation
    const validationError = validate();
    if (validationError.length) {
      setErrorMessage(validationError);
      return;
    }
    try {
      setIsPublishing(true);

      // step 2: upload video to S3 bucket - /api/v1/video/upload - URL
      const accessToken = user?.signInDetails?.loginId as string;

      const uploadVideoResponse = await FileSystem.uploadAsync(
        `${BASE_URL}/api/v1/video/upload`,
        videoUri,
        {
          fieldName: "video-content",
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          headers: {
            "cognito-token": accessToken,
          },
        }
      );

      const { videoUrl } = JSON.parse(
        uploadVideoResponse.body
      ) as UploadVideoApiResponse;

      // step 3: upload image to S3 bucket - /api/v1/video/coverImage - URL
      const uploadImageResponse = await FileSystem.uploadAsync(
        `${BASE_URL}/api/v1/video/coverImage`,
        imageUri,
        {
          fieldName: "cover-image",
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          headers: {
            "cognito-token": accessToken,
          },
        }
      );

      const { imageUrl } = JSON.parse(
        uploadImageResponse.body
      ) as UploadCoverImageApiResponse;

      // step 4: create videopost and save to MongoDB  - /api/v1/video/new
      await axios.post(
        `${BASE_URL}/api/v1/video/new`,
        {
          restaurantName,
          postTitle: postName,
          videoUrl,
          imageUrl,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "cognito-token": accessToken,
          },
        }
      );

      setIsPublishing(false);
      setStep(CreateContentScreenStep.Success);
    } catch (err) {
      setIsPublishing(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("unknown error");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isPublishing ? (
        <View style={styles.loaderContainer}>
          <Text>Publishing your post. Please wait for a moment...</Text>
          <FontAwesome name="spinner" size={50} />
        </View>
      ) : (
        <>
          <View style={styles.headerContainer}>
            <FontAwesome.Button
              name="angle-left"
              backgroundColor="transparent"
              color={colors.mainText}
              size={26}
              onPress={() => {
                setStep(CreateContentScreenStep.Review);
              }}
            />
            <Text style={styles.headerText}>New Post</Text>
            {/* spacer */}
            <View />
          </View>

          <View style={styles.formContainer}>
            <Text>Post name</Text>
            <TextInput
              value={postName}
              onChangeText={setPostName}
              placeholder="Enter post name (up to 50 characters)"
              style={styles.inputField}
            />

            <Text>Restaurant name</Text>
            <TextInput
              value={restaurantName}
              onChangeText={setRestaurantName}
              placeholder="Enter restaurant name"
              style={styles.inputField}
            />

            <Pressable style={styles.setCoverImageBtn} onPress={pickImage}>
              <FontAwesome name="photo" color={colors.primary} size={20} />
              <Text style={{ color: colors.primary }}>Set Cover Image</Text>
            </Pressable>
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{ height: 200, width: 200 }}
              />
            )}

            <View style={styles.footerContainer}>
              {errorMessage && (
                <Text style={{ color: "#ec1313" }}>{errorMessage}</Text>
              )}
              <Pressable style={styles.publishBtn} onPress={handlePublish}>
                <Text style={styles.publishBtnText}>Publish</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mainBg,
    paddingHorizontal: 9,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "500",
  },
  formContainer: {
    flex: 1,
  },
  inputField: {
    borderWidth: 1,
    borderColor: "grey",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 6,
    fontSize: 16,
    marginTop: 12,
    marginBottom: 18,
  },
  setCoverImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerContainer: {
    marginTop: "auto",
    gap: 15,
  },
  publishBtn: {
    backgroundColor: colors.primary,
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
  },
  publishBtnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "500",
  },
});
