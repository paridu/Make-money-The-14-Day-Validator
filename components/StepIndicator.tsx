import React from 'react';
import { Phase } from '../types';

interface StepIndicatorProps {
  currentPhase: Phase;
}

const steps: { id: Phase; label: string; sub: string }[] = [
  { id: 'idea', label: 'ไอเดีย & D³', sub: 'วันที่ 1-3' },
  { id: 'content', label: 'วิดีโอเดโม', sub: 'วันที่ 4-5' },
  { id: 'demand', label: 'เช็คกระแส', sub: 'วันที่ 6-7' },
  { id: 'mvp', label: 'สร้าง MVP', sub: 'สัปดาห์ที่ 2' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentPhase }) => {
  const currentIndex = steps.findIndex(s => s.id === currentPhase);

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-700 -z-10 rounded"></div>
        <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-indigo-500 -z-10 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isActive 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/50' 
                    : 'bg-slate-800 border-slate-600 text-slate-400'
                }`}
              >
                {index + 1}
              </div>
              <div className={`mt-2 text-xs md:text-sm font-medium ${isCurrent ? 'text-indigo-400' : 'text-slate-500'}`}>
                {step.label}
              </div>
              <div className="text-[10px] text-slate-600">{step.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;