import React from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, Bot, User, ArrowDown, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';

interface FlowDiagramProps {
  className?: string;
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({ className }) => {
  const steps = [
    {
      id: 'caregiver',
      title: 'CAREGIVER',
      subtitle: 'Configures schedules & receives peace-of-mind alerts',
      icon: <HeartHandshake className="w-7 h-7 text-amber-700" />,
      badgeBg: 'bg-amber-100/70 border-amber-200 text-amber-900',
      iconBg: 'bg-amber-50 border-amber-200 text-amber-700',
    },
    {
      id: 'medsathi',
      title: 'MEDSATHI',
      subtitle: 'Voice-first AI companion verifying and guiding medication',
      icon: <Bot className="w-8 h-8 text-teal-700" />,
      badgeBg: 'bg-teal-100/70 border-teal-200 text-teal-900',
      iconBg: 'bg-teal-50 border-teal-200 text-teal-700 ring-4 ring-teal-500/10',
      isCenter: true,
    },
    {
      id: 'patient',
      title: 'PATIENT',
      subtitle: 'Speaks naturally, listens with ease, stays confident',
      icon: <User className="w-7 h-7 text-emerald-700" />,
      badgeBg: 'bg-emerald-100/70 border-emerald-200 text-emerald-900',
      iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
  ];

  return (
    <div
      className={cn(
        'w-full max-w-4xl mx-auto p-6 md:p-10 rounded-3xl bg-gradient-to-b from-stone-50/80 to-white/90 border border-stone-200/90 shadow-sm',
        className
      )}
    >
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-widest font-bold text-stone-500">
          The MedSathi Care Bridge
        </span>
        <h4 className="text-xl md:text-2xl font-bold text-stone-900 mt-1">
          Connected, Dignified Daily Care
        </h4>
      </div>

      {/* Desktop & Tablet: Horizontal / Stepped Flow */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.4 }}
              className={cn(
                'flex-1 flex flex-col items-center text-center p-6 rounded-2xl border transition-all duration-300',
                step.isCenter
                  ? 'bg-teal-50/60 border-teal-200/90 shadow-sm scale-105'
                  : 'bg-white border-stone-200 shadow-sm hover:border-stone-300'
              )}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center border mb-3',
                  step.iconBg
                )}
              >
                {step.icon}
              </div>
              <span
                className={cn(
                  'text-xs font-bold tracking-wider px-3 py-1 rounded-full border mb-2',
                  step.badgeBg
                )}
              >
                {step.title}
              </span>
              <p className="text-xs text-stone-600 leading-snug">
                {step.subtitle}
              </p>
            </motion.div>

            {index < steps.length - 1 && (
              <div className="flex flex-col items-center justify-center px-1 text-stone-400">
                <ArrowRight className="w-6 h-6 animate-pulse text-stone-400" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile Flow: Vertical Stack with Clear Arrows */}
      <div className="flex md:hidden flex-col items-center gap-3">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-2xl border',
                step.isCenter
                  ? 'bg-teal-50/80 border-teal-200 shadow-sm'
                  : 'bg-white border-stone-200 shadow-sm'
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-xl shrink-0 flex items-center justify-center border',
                  step.iconBg
                )}
              >
                {step.icon}
              </div>
              <div className="flex-1 text-left">
                <span
                  className={cn(
                    'text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border inline-block mb-1',
                    step.badgeBg
                  )}
                >
                  {step.title}
                </span>
                <p className="text-xs text-stone-600 leading-snug">
                  {step.subtitle}
                </p>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="py-1">
                <ArrowDown className="w-5 h-5 text-stone-400 animate-bounce" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
