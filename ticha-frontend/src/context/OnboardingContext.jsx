import { useState } from "react";
import { OnboardingContext } from "./OnboardingContextCreator";

export const OnboardingProvider = ({ children }) => {
  const [onboarding, setOnboarding] = useState({
    goals: [],
    level: null,
    subjects: []
  });

  const toggleGoal = (goal) => {
    setOnboarding((prev) => {
      const exists = prev.goals.includes(goal);
      return {
        ...prev,
        goals: exists
          ? prev.goals.filter((g) => g !== goal)
          : [...prev.goals, goal]
      };
    });
  };

  const setLevel = (level) => {
    setOnboarding((prev) => ({
      ...prev,
      level
    }));
  };

  return (
    <OnboardingContext.Provider
      value={{ onboarding, toggleGoal, setLevel }}>
      {children}
    </OnboardingContext.Provider>
  );
};
