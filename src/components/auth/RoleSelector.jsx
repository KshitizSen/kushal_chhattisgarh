import React from 'react';
import { motion } from 'framer-motion';
import { Shield, GraduationCap, Landmark, Users, Loader2 } from 'lucide-react';

// Map backend role names → display config
const ROLE_DISPLAY = {
  admin:                       { label: 'Admin',     description: 'Administrator',         icon: Shield },
  vocational_teacher_provider: { label: 'VTP',       description: 'VT Provider',           icon: GraduationCap },
  headmaster:                  { label: 'Principal',  description: 'School Head',           icon: Landmark },
  deo:                         { label: 'DEO',        description: 'District Edu. Officer', icon: Users },
};

const RoleSelector = ({ value, onChange, error, roles = [], isLoading = false }) => {
  return (
    <div className="w-full">
      <label className="block text-[10px] font-semibold text-white/45 uppercase tracking-wider mb-3">
        Login As
      </label>

      {isLoading ? (
        <div className="flex items-center justify-center h-[72px] rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <Loader2 className="w-4 h-4 animate-spin text-white/40" />
          <span className="ml-2 text-xs text-white/40">Loading roles…</span>
        </div>
      ) : (
        <div
          className="relative grid gap-2 p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]"
          style={{ gridTemplateColumns: `repeat(${roles.length}, minmax(0, 1fr))` }}
        >
          {/* Animated sliding indicator */}
          {value && (
            <motion.div
              layoutId="role-indicator"
              className="absolute top-1.5 bottom-1.5 rounded-lg bg-gradient-to-br from-violet-600/80 to-indigo-600/80 shadow-lg shadow-violet-500/20"
              style={{
                width: `calc(${100 / roles.length}% - 0.5rem)`,
                left: `calc(${roles.findIndex(r => r.id === value) * (100 / roles.length)}% + 0.375rem)`,
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}

          {roles.map((role) => {
            const display = ROLE_DISPLAY[role.name] || {
              label: role.name,
              description: role.description,
              icon: Shield,
            };
            const isActive = value === role.id;
            const RoleIcon = display.icon;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onChange(role.id)}
                className={`
                  relative z-10 flex flex-col items-center justify-center py-3 px-2 rounded-lg
                  transition-colors duration-200 cursor-pointer
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50
                  ${isActive ? 'text-white' : 'text-white/40 hover:text-white/60'}
                `}
                aria-pressed={isActive}
                role="radio"
                aria-checked={isActive}
                aria-label={`Login as ${display.label}`}
              >
                <RoleIcon className={`w-4 h-4 mb-1.5 transition-all duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-xs font-bold tracking-wide">{display.label}</span>
                <span className={`text-[9px] mt-0.5 transition-colors duration-200 ${isActive ? 'text-white/70' : 'text-white/25'}`}>
                  {display.description}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-400 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default RoleSelector;
