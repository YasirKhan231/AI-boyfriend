import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Zap } from "lucide-react";

interface PaywallScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PaywallScreen({ onNext, onBack }: PaywallScreenProps) {
  const handlePaymentComplete = () => {
    // Call onNext to proceed to the next step
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Choose the Plan That's Perfect for You
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <p className="text-muted-foreground">
        Start for free or unlock premium features today!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="border border-border rounded-lg p-6 relative  hover:cursor-pointer">
          <div className="absolute top-4 right-4">
            <Zap className="h-5 w-5" />
          </div>

          <h3 className="text-muted-foreground mb-2">Basic plan</h3>
          <div className="text-3xl font-bold mb-1">$4.99 / Week</div>
          <p className="text-sm text-muted-foreground">Billed annually.</p>

          <ul className="mt-6 space-y-2">
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-400" />
              <span>AI-powered chat</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-400" />
              <span>Basic voice selection</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-400" />
              <span>Limited storytelling</span>
            </li>
          </ul>
        </div>

        <div
          className="border border-border rounded-lg p-6 relative bg-secondary/20 hover:cursor-pointer
"
        >
          <div className="absolute top-4 right-4">
            <Zap className="h-5 w-5" />
          </div>

          <div className="absolute -top-3 right-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            Save 37%
          </div>

          <h3 className="text-muted-foreground mb-2">Monthly Plan</h3>
          <div className="text-3xl font-bold mb-1">$2.49 / Month</div>
          <p className="text-sm text-muted-foreground">Billed annually.</p>

          <ul className="mt-6 space-y-2">
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-400" />
              <span>Unlimited AI-powered chat & calls</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-400" />
              <span>All premium voice options</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-400" />
              <span>Advanced immersive storytelling</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-400" />
              <span>Priority support</span>
            </li>
          </ul>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Change plans or cancel anytime
      </p>

      <Button
        onClick={handlePaymentComplete}
        className="w-full rounded-full hover:cursor-pointer"
      >
        Continue
      </Button>

      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  );
}
