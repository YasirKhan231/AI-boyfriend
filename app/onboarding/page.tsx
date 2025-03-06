"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig"; // Ensure you import Firestore
import { doc, setDoc } from "firebase/firestore"; //
import WelcomeScreen from "@/components/onboarding/welcome-screen";
import OnboardingForm from "@/components/onboarding/onboarding-form";
import VoiceSelection from "@/components/onboarding/voice-selection";
import FantasyQuestions from "@/components/onboarding/fantasy-questions";
import PaywallScreen from "@/components/onboarding/paywall-screen";
import SuccessScreen from "@/components/onboarding/success-screen";
import LoadingScreen from "@/components/onboarding/loading-screen";

export default function Home() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: "",
    dob: "",
    selectedVoice: "",
    answers: ["", "", "", "", ""],
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/signin");
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);
  const handleComplete = async () => {
    // Log the data in the browser console
    console.log("Onboarding Data:", userData);

    // Send data to the local API endpoint
    try {
      const response = await fetch(
        "http://localhost:8000/onboardingdata/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit onboarding data");
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Store data in Firestore
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          onboardingData: userData,
          createdAt: new Date(),
        });
        console.log("Data stored in Firestore");
      }
    } catch (error) {
      console.error("Error submitting onboarding data:", error);
    }

    // Move to the next step (e.g., SuccessScreen)
    handleNext();
  };

  const handleNext = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
      setIsLoading(false);
    }, 1000);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const updateUserData = (data: Partial<typeof userData>) => {
    setUserData({ ...userData, ...data });
    // console.log(userData);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen onNext={handleNext} />;
      case 1:
        return (
          <OnboardingForm
            userData={userData}
            updateUserData={updateUserData}
            onNext={handleNext}
            onBack={handleBack}
            currentStep={currentStep}
          />
        );
      case 2:
        return (
          <VoiceSelection
            userData={userData}
            updateUserData={updateUserData}
            onNext={handleNext}
            onBack={handleBack}
            currentStep={currentStep}
          />
        );
      case 3:
        return (
          <FantasyQuestions
            userData={userData}
            updateUserData={updateUserData}
            onNext={handleNext}
            onBack={handleBack}
            currentStep={currentStep}
          />
        );
      case 4:
        return <PaywallScreen onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <SuccessScreen userData={userData} />;
      default:
        return <WelcomeScreen onNext={handleNext} />;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md mx-auto">{renderStep()}</div>
    </main>
  );
}
