import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Volume2, ShieldCheck, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { FlowDiagram } from '../components/ui/FlowDiagram.js';
import { useHealthCheck } from '../hooks/useHealthCheck.js';

export const HomePage: React.FC = () => {
  const { health, loading: healthLoading } = useHealthCheck();

  const scrollToHowItWorks = () => {
    const section = document.getElementById('how-it-works');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 mb-6"
        >
          <Badge variant="teal" size="md">
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            Phase 1 Foundation Architecture
          </Badge>
          {health && (
            <Badge variant="emerald" size="sm" className="hidden sm:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping mr-1" />
              API Connected
            </Badge>
          )}
        </motion.div>

        {/* Project Name */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm md:text-base font-extrabold uppercase tracking-widest text-teal-800 mb-4"
        >
          MEDSATHI
        </motion.h2>

        {/* Main Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-stone-900 tracking-tight leading-[1.15] mb-6 max-w-4xl mx-auto"
        >
          Care that speaks. <br className="hidden sm:inline" />
          <span className="text-teal-700">Confidence that stays.</span>
        </motion.h1>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg sm:text-xl md:text-2xl text-stone-600 max-w-3xl mx-auto leading-relaxed mb-10"
        >
          An AI-powered medication companion that helps patients understand,
          verify and complete their medication routine while keeping caregivers
          informed.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16"
        >
          <Link to="/register" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Create Caregiver Account
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={scrollToHowItWorks}
            className="w-full sm:w-auto"
          >
            See How It Works
          </Button>
        </motion.div>

        {/* The Caregiver -> MedSathi -> Patient Visual Flow */}
        <div id="how-it-works" className="pt-4 scroll-mt-24">
          <FlowDiagram />
        </div>
      </section>

      {/* Human-First Design Pillars */}
      <section className="w-full py-16 bg-white border-y border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-teal-700">
              Designed For Real Lives
            </span>
            <h3 className="text-3xl font-bold text-stone-900 mt-2">
              A Warm Healthcare Companion, Not a Clinical Dashboard
            </h3>
            <p className="text-base text-stone-600 mt-3">
              Built from the ground up for low-stress interaction, large accessible targets, and soothing guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-stone-50 border border-stone-200/80 flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-800 mb-5">
                <Volume2 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-stone-900 mb-2">Voice-First Simplicity</h4>
              <p className="text-sm text-stone-600 leading-relaxed">
                Empowering elderly and low-literacy users through intuitive spoken guidance in their native dialect.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-stone-50 border border-stone-200/80 flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 mb-5">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-stone-900 mb-2">Caregiver Peace of Mind</h4>
              <p className="text-sm text-stone-600 leading-relaxed">
                Keeping family members and caregivers effortlessly updated on doses taken, missed, or needing attention.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-stone-50 border border-stone-200/80 flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-stone-900 mb-2">Calm & Trustworthy</h4>
              <p className="text-sm text-stone-600 leading-relaxed">
                High-contrast typography, generous spacing, and empathetic responses designed to reduce medication anxiety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Backend & Architectural Status (Phase 1 Inspection) */}
      <section className="w-full py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="p-6 md:p-8 rounded-3xl bg-teal-900 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest font-bold text-teal-300">
              System Architecture Check
            </span>
            <h4 className="text-xl font-bold text-white">Backend Health Endpoint</h4>
            <p className="text-sm text-teal-100">
              Verified endpoint: <code className="bg-teal-950/60 px-2 py-0.5 rounded text-teal-200 font-mono text-xs">GET /api/health</code>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {healthLoading ? (
              <span className="text-xs text-teal-200 animate-pulse">Checking status...</span>
            ) : health ? (
              <div className="flex items-center gap-2 bg-teal-800/80 px-4 py-2 rounded-2xl border border-teal-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-left text-xs">
                  <p className="font-semibold text-white">Service: {health.service}</p>
                  <p className="text-teal-300">Status: {health.status}</p>
                </div>
              </div>
            ) : (
              <div className="text-xs bg-teal-950 px-3 py-2 rounded-xl text-teal-300">
                Start backend to connect live
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
