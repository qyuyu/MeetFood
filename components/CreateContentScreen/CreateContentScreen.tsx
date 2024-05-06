import { useState } from "react";
import { RecordStep } from "./RecordStep";
import { SuccessStep } from "./SuccessStep";
import { ReviewStep } from "./ReviewStep";
import { PublishStep } from "./PublishStep";
import { CreateContentScreenStep } from "../../type";

export const CreateContentScreen = () => {
  const [step, setStep] = useState(CreateContentScreenStep.Record);
  // state lift-up to save Jotai Global State Management
  const [videoUri, setVideoUri] = useState("");
  if (step === CreateContentScreenStep.Record) {
    return <RecordStep setStep={setStep} setVideoUri={setVideoUri} />;
  } else if (step === CreateContentScreenStep.Review) {
    return (
      <ReviewStep
        videoUri={videoUri}
        setStep={setStep}
        setVideoUri={setVideoUri}
      />
    );
  } else if (step === CreateContentScreenStep.Publish) {
    return <PublishStep videoUri={videoUri} setStep={setStep} />;
  }
  return <SuccessStep setStep={setStep} setVideoUri={setVideoUri} />;
};
