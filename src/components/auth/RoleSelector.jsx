import React from 'react';
import { motion } from 'framer-motion';
import { Shield, GraduationCap, Landmark } from 'lucide-react';

const roles = [
  { value: 'admin', label: 'Admin', description: 'Administrator', icon: Shield },
  { value: 'vtp', label: 'VTP', description: 'Vocational Teacher', icon: GraduationCap },
  { value: 'principal', label: 'Principal', description: 'School Head', icon: Landmark },
];

const RoleSelector = ({ value, onChange, error }) => {
  return (
    <div className="w-full">
      <label className="block text-[10px] font-semibold text-white/45 uppercase tracking-wider mb-3">
        Login As
      </label>

      <div className="relative grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
        {/* Animated sliding indicator */}
        {value && (
          <motion.div
            layoutId="role-indicator"
            className="absolute top-1.5 bottom-1.5 rounded-lg bg-gradient-to-br from-violet-600/80 to-indigo-600/80 shadow-lg shadow-violet-500/20"
            style={{
              width: `calc(${100 / 3}% - 0.5rem)`,
              left: `calc(${roles.findIndex(r => r.value === value) * (100 / 3)}% + 0.375rem)`,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}

        {roles.map((role) => {
          const isActive = value === role.value;
          const RoleIcon = role.icon;

          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              className={`
                relative z-10 flex flex-col items-center justify-center py-3 px-2 rounded-lg
                transition-colors duration-200 cursor-pointer
                focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50
                ${isActive ? 'text-white' : 'text-white/40 hover:text-white/60'}
              `}
              aria-pressed={isActive}
              role="radio"
              aria-checked={isActive}
              aria-label={`Login as ${role.description}`}
            >
              <RoleIcon className={`w-4 h-4 mb-1.5 transition-all duration-200 ${
                isActive ? 'scale-110' : ''
              }`} />
              <span className="text-xs font-bold tracking-wide">{role.label}</span>
              <span className={`text-[9px] mt-0.5 transition-colors duration-200 ${
                isActive ? 'text-white/70' : 'text-white/25'
              }`}>
                {role.description}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default RoleSelector;
