interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
}: ProgressBarProps) {
  return (
    <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
      <div
        className="h-full bg-white transition-all duration-300 ease-in-out"
        style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
      ></div>
    </div>
  );
}
