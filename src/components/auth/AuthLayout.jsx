import React from 'react';
import { motion } from 'framer-motion';
import {
  School,
  ShieldCheck,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import vtpIcon from '../../assets/images/cglogo.png';

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure Access',
    description: 'Role-based authentication for every stakeholder',
  },
  {
    icon: BookOpen,
    title: 'Smart Analytics',
    description: 'Dashboards & detailed reports',
  },
  {
    icon: Sparkles,
    title: 'Modern Platform',
    description: 'Built for the future of vocational education',
  },
];

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex auth-bg-premium">
      {/* Animated mesh background */}
      <div className="auth-mesh-bg" aria-hidden="true" />

      {/* Floating geometric shapes */}
      <div className="auth-geo auth-geo-1" aria-hidden="true" />
      <div className="auth-geo auth-geo-2" aria-hidden="true" />
      <div className="auth-geo auth-geo-3" aria-hidden="true" />
      <div className="auth-geo auth-geo-4" aria-hidden="true" />

      {/* Noise texture overlay */}
      <div className="auth-noise" aria-hidden="true" />

      {/* ─── Left Branding Panel ─── */}
      <div className="hidden lg:flex lg:w-[520px] xl:w-[580px] 2xl:w-[640px] flex-col justify-between p-10 xl:p-12 relative z-10">
        {/* Logo + Title */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-white/10 shadow-lg">
              <img
                src={vtpIcon}
                alt="Chhattisgarh government logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-white tracking-tight">
                Kushal Chhattisgarh
              </h1>
              <p className="text-[11px] text-white/50 font-semibold tracking-widest uppercase">
                Skill Development Portal
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hero Text + Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="space-y-8"
        >
          {/* Hero heading */}
          <div className="space-y-4">
            <h2 className="text-3xl xl:text-[2.5rem] 2xl:text-[2.75rem] font-heading font-extrabold text-white leading-[1.15] tracking-tight">
              Transforming{' '}
              <span className="auth-gradient-text">
                Skill Education
              </span>{' '}
              Across Chhattisgarh
            </h2>
            <p className="text-[15px] text-white/45 leading-relaxed max-w-md font-medium">
              Bridging education, skills and the world of work for empowered futures.
            </p>
          </div>

          {/* Decorative divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 via-indigo-500/20 to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-500/20" />
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.12 }}
                className="flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.1] group-hover:border-white/[0.14] transition-all duration-300">
                  <feature.icon className="w-[18px] h-[18px] text-violet-400/80 group-hover:text-violet-300 transition-colors" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white/85 group-hover:text-white transition-colors">
                    {feature.title}
                  </p>
                  <p className="text-[11px] text-white/35 mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex items-center gap-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 animate-pulse" />
          <p className="text-xs text-white/30 font-medium">
            © {new Date().getFullYear()} Department of Skill Development,
            Govt. of Chhattisgarh
          </p>
        </motion.div>
      </div>

      {/* ─── Divider ─── */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/10 to-transparent my-8" />

      {/* ─── Right Form Panel ─── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-10">
        <div className="w-full max-w-[440px]">
          {/* Mobile branding (hidden on lg+) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:hidden text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/90 to-indigo-600/90 mb-4 shadow-glow-violet ring-4 ring-violet-500/10">
              <School className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
              Kushal Chhattisgarh
            </h1>
            <p className="text-sm text-white/40 mt-1.5 font-medium">
              Vocational Education Management System
            </p>
          </motion.div>

          {children}

          {/* Mobile footer */}
          <div className="lg:hidden mt-8 text-center">
            <p className="text-xs text-white/25 font-medium">
              © {new Date().getFullYear()} Dept. of Skill Development, Govt.
              of Chhattisgarh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
