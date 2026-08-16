import { Check } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface Props {
  currentStep: number;
  steps: Step[];
}

export function ProgressStepper({ currentStep, steps }: Props) {
  return (
    <div className="w-full py-8 bg-white border-b">
      <div className="container max-w-6xl mx-auto px-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-slate-500 hidden md:block">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 -mt-12 transition-all ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
