import { Link } from 'react-router-dom';
import { Heart, Activity, Shield, Pill, Stethoscope, ClipboardList, CheckCircle, ArrowRight, Zap, FileCheck } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const features = [
  {
    icon: Activity,
    title: 'Disease Prediction',
    description: 'Advanced AI analyzes your symptoms against thousands of medical patterns to provide accurate disease predictions with confidence scores.',
  },
  {
    icon: Shield,
    title: 'Smart Triage',
    description: 'Intelligent priority assessment ensures critical cases are flagged and reviewed first, optimizing healthcare delivery.',
  },
  {
    icon: Pill,
    title: 'Medicine Recommendation',
    description: 'Evidence-based medication suggestions tailored to the predicted condition, always verified by qualified doctors.',
  },
];

const steps = [
  { icon: ClipboardList, title: 'Patient Submits', description: 'Select symptoms from a comprehensive medical symptom database' },
  { icon: Zap, title: 'AI Triage', description: 'Smart priority assessment based on symptom severity' },
  { icon: Activity, title: 'Disease Prediction', description: 'AI predicts possible conditions with confidence levels' },
  { icon: Stethoscope, title: 'Doctor Reviews', description: 'Licensed physician validates, modifies, or rejects AI findings' },
  { icon: FileCheck, title: 'Patient Gets Results', description: 'Receive doctor-verified diagnosis and treatment plan' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-secondary-100/60 via-secondary-50/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-50/60 via-sky-50/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-50 rounded-full border border-secondary-200 mb-8">
              <Heart size={14} className="text-secondary-500" />
              <span className="text-sm font-medium text-secondary-700">AI-Powered Healthcare Platform</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-primary-800 leading-tight tracking-tight mb-6">
              AI-Assisted Healthcare,{' '}
              <span className="text-secondary-500">Doctor-Validated</span>{' '}
              Results
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Submit your symptoms and receive AI-powered disease predictions, intelligently triaged and always verified by qualified healthcare professionals before reaching you.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-secondary-500 text-white font-semibold rounded-xl hover:bg-secondary-600 transition-all duration-200 shadow-lg shadow-secondary-500/25"
              >
                Access Platform
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary-800 mb-4">Intelligent Healthcare Features</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Combining cutting-edge AI technology with medical expertise for better health outcomes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-secondary-200 hover:shadow-lg hover:shadow-secondary-500/5 transition-all duration-300 group">
                <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-secondary-100 transition-colors">
                  <feature.icon size={24} className="text-secondary-500" />
                </div>
                <h3 className="text-lg font-semibold text-primary-800 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary-800 mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-xl mx-auto">A streamlined process from symptom submission to doctor-verified results.</p>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-2xl border-2 border-secondary-200 flex items-center justify-center mb-4 shadow-sm">
                  <step.icon size={28} className="text-secondary-500" />
                </div>
                <div className="absolute top-8 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-0.5 bg-secondary-200 hidden md:block" style={{ display: i === steps.length - 1 ? 'none' : undefined }} />
                <span className="text-xs font-bold text-secondary-500 mb-1">Step {i + 1}</span>
                <h4 className="text-sm font-semibold text-primary-800 mb-2">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Validation Callout */}
      <section id="benefits" className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-12 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-secondary-50 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-center gap-10">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-secondary-50 rounded-2xl flex items-center justify-center">
                  <Shield size={40} className="text-secondary-500" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary-800 mb-4">Every Result is Doctor-Validated</h3>
                <p className="text-slate-500 leading-relaxed mb-6">
                  Unlike other AI health tools, our platform ensures that every prediction is reviewed and validated by a licensed healthcare professional. 
                  Doctors can approve, modify, or reject AI findings before they reach patients — ensuring safety, accuracy, and trust.
                </p>
                <div className="flex flex-wrap gap-6">
                  {['AI-powered accuracy', 'Human oversight', 'Priority-based triage', 'Secure & private'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-secondary-500" />
                      <span className="text-sm font-medium text-primary-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-secondary-500 rounded-lg flex items-center justify-center">
              <Heart size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-primary-800">Health<span className="text-secondary-500">AI</span></span>
          </div>
          <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} HealthAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
