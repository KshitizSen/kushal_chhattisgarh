import React from 'react';
import { motion } from 'framer-motion';
import { School, ShieldCheck, BookOpen, Sparkles } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure Access',
    description: 'Role-based authentication for every stakeholder',
  },
  {
    icon: BookOpen,
    title: 'Smart Analytics',
    description: 'Real-time dashboards & detailed reports',
  },
  {
    icon: Sparkles,
    title: 'Modern Platform',
    description: 'Built for the future of vocational education',
  },
];

const floatingOrbs = [
  { className: 'orb orb-1' },
  { className: 'orb orb-2' },
  { className: 'orb orb-3' },
];

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex auth-bg">
      {/* Floating background orbs */}
      {floatingOrbs.map((orb, i) => (
        <div key={i} className={orb.className} aria-hidden="true" />
      ))}

      {/* ─── Left Branding Panel ─── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between p-10 relative z-10">
        {/* Logo + Title */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-glow-violet">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-white tracking-tight">
                Kushal Chhattisgarh
              </h1>
              <p className="text-xs text-white/50 font-medium tracking-wide uppercase">
                Skill Development Portal
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="space-y-6"
        >
          <h2 className="text-4xl xl:text-5xl font-heading font-extrabold text-white leading-tight">
            Empowering{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Vocational
            </span>{' '}
            Education
          </h2>
          <p className="text-lg text-white/50 leading-relaxed max-w-md">
            A unified platform for managing training programs, tracking progress,
            and building skills across Chhattisgarh.
          </p>

          {/* Feature list */}
          <div className="space-y-4 pt-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
                className="flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.08] border border-white/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <feature.icon className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">{feature.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Department of Skill Development,
            Govt. of Chhattisgarh
          </p>
        </motion.div>
      </div>

      {/* ─── Right Form Panel ─── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile branding (hidden on lg+) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:hidden text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 shadow-glow-violet">
              <School className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">
              Kushal Chhattisgarh
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Vocational Education Management System
            </p>
          </motion.div>

          {children}

          {/* Mobile footer */}
          <div className="lg:hidden mt-8 text-center">
            <p className="text-xs text-white/25">
              © {new Date().getFullYear()} Dept. of Skill Development, Govt. of Chhattisgarh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
