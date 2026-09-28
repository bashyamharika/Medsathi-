import React from 'react';
import { Activity, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-100 border-t border-stone-200/90 text-stone-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-stone-900">
                MED<span className="text-teal-700">SATHI</span>
              </span>
            </div>
            <p className="text-base text-stone-600 max-w-md leading-relaxed">
              Care that speaks. Confidence that stays. A voice-first AI companion
              dedicated to empowering elderly and low-literacy patients with dignified,
              stress-free medication routines.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Built for human-first healthcare accessibility</span>
            </div>
          </div>

          {/* Foundation Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-teal-700 transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/caregiver/dashboard" className="hover:text-teal-700 transition-colors">
                  Caregiver Portal
                </Link>
              </li>
              <li>
                <Link to="/patient/demo-patient-001" className="hover:text-teal-700 transition-colors">
                  Patient Mode (Demo)
                </Link>
              </li>
            </ul>
          </div>

          {/* Phase 1 Status */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4">
              Phase 1 Status
            </h4>
            <div className="p-4 rounded-2xl bg-white border border-stone-200 text-xs space-y-1.5 text-stone-600">
              <div className="flex items-center gap-1.5 font-semibold text-teal-800">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Foundation Layer Active
              </div>
              <p>Routing, Design System, Express API, Supabase & Cloudinary Foundation configured.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} MedSathi Project. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-600" /> for elderly care
          </p>
        </div>
      </div>
    </footer>
  );
};
