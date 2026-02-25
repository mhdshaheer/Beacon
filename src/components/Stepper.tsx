'use client';

interface StepperProps {
  currentStep: number;
  steps: string[];
}

export default function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="w-full mb-12">
      <div className="flex justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => (
          <div key={index} className="relative z-10 flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-emerald-500 text-black' 
                  : 'bg-[#1a1a1a] text-gray-500 border border-white/10'
              }`}
            >
              {index + 1}
            </div>
            <span 
              className={`absolute top-12 text-[10px] md:text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                index <= currentStep ? 'text-emerald-400' : 'text-gray-600'
              } ${index === currentStep ? 'opacity-100 scale-100' : 'opacity-0 scale-95 md:opacity-100 md:scale-100'}`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
