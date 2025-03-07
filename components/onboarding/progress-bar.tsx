interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
}: ProgressBarProps) {
  const progress = Math.min((currentStep / totalSteps) * 100, 100); // Ensures it doesn't exceed 100%

  return (
    <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300 ease-in-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
