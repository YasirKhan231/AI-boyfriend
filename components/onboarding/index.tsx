"use client";

import { useState } from "react";
import Home from "./home";
import Loading from "./loading";
import Section1 from "./section1";
import Section2 from "./section2";
import Section3 from "./section3";
import Generating from "./generating";
import Completion from "./completion";

type OnboardingStep =
  | "home"
  | "loading"
  | "section1"
  | "section2"
  | "section3"
  | "generating"
  | "completion";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("home");
  const [userSelections, setUserSelections] = useState({
    dream: "",
    genre: "",
    personality: "",
  });

  const handleStart = () => {
    setCurrentStep("loading");
  };

  const handleDreamSelected = (dream: string) => {
    setUserSelections((prev) => ({ ...prev, dream }));
    setCurrentStep("section2");
  };

  const handleGenreSelected = (genre: string) => {
    setUserSelections((prev) => ({ ...prev, genre }));
    setCurrentStep("section3");
  };

  const handlePersonalitySelected = (personality: string) => {
    setUserSelections((prev) => ({ ...prev, personality }));
    setCurrentStep("generating");
  };

  const handleReset = () => {
    setCurrentStep("home");
    setUserSelections({
      dream: "",
      genre: "",
      personality: "",
    });
  };

  return (
    <div className="dark">
      {currentStep === "home" && <Home onStart={handleStart} />}

      {currentStep === "loading" && (
        <Loading onComplete={() => setCurrentStep("section1")} />
      )}

      {currentStep === "section1" && (
        <Section1
          onNext={handleDreamSelected}
          onBack={() => setCurrentStep("home")}
        />
      )}

      {currentStep === "section2" && (
        <Section2
          onNext={handleGenreSelected}
          onBack={() => setCurrentStep("section1")}
        />
      )}

      {currentStep === "section3" && (
        <Section3
          onNext={handlePersonalitySelected}
          onBack={() => setCurrentStep("section2")}
        />
      )}

      {currentStep === "generating" && (
        <Generating onComplete={() => setCurrentStep("completion")} />
      )}

      {currentStep === "completion" && <Completion onReset={handleReset} />}
    </div>
  );
}
