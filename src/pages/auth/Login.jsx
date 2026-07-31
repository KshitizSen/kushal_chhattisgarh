import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, Code, Phone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { ROLE_DASHBOARDS, API_BASE_URL } from '../../utils/constants';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
import RoleSelector from '../../components/auth/RoleSelector';
import api from '../../services/api';

// ─── Roles excluded from the login selector ───────────────────────────────────
const EXCLUDED_ROLES = ['programmer', 'super_admin', 'vocational_teacher'];

// ─── Map backend role name → frontend route key ───────────────────────────────
// headmaster is shown as "Principal" in UI but maps to /principal/dashboard
const BACKEND_TO_FRONTEND_ROLE = {
  headmaster: 'principal',
  vocational_teacher_provider: 'vtp',
  admin: 'admin',
  deo: 'deo',
};

// ─── Validation schema ────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().min(1, 'Required field'),
  password: z.string().min(1, 'Required field'),
  role_id: z.number({ required_error: 'Please select a role', invalid_type_error: 'Please select a role' }),
});

// ─── Component ────────────────────────────────────────────────────────────────
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', role_id: null },
  });

  const selectedRoleId = watch('role_id');

  // ── Derive the selected role object ─────────────────────────────────────────
  const selectedRole = roles.find((r) => r.id === selectedRoleId) || null;
  const isHeadmaster = selectedRole?.name === 'headmaster';

  // ── Fetch roles from API on mount ────────────────────────────────────────────
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get(`${API_BASE_URL}/auth/roles`);
        if (res.data?.status) {
          const filtered = res.data.data.filter(
            (r) => r.is_active && !EXCLUDED_ROLES.includes(r.name)
          );
          setRoles(filtered);
          // Auto-select the first role
          if (filtered.length > 0) {
            setValue('role_id', filtered[0].id);
          }
        }
      } catch (err) {
        toast.error('Could not load roles. Please refresh.');
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, [setValue]);

  // ── Submit ───────────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Single unified payload for ALL roles
      const payload = {
        role_id: data.role_id,
        email: data.email,   // backend accepts email OR mobile in this field
        password: data.password,
      };

      const response = await api.post(`${API_BASE_URL}/auth/web/login`, payload);
      const result = response.data;

      if (result.status) {
        const { user, tokens, headmaster_details, deo_details, vtp_details } = result.data;

        // Map backend role name → frontend route key
        const frontendRole = BACKEND_TO_FRONTEND_ROLE[user.role] || user.role;

        const loggedInUser = {
          ...user,
          // Merge role-specific details so they're available on user.*
          ...(headmaster_details || {}),
          ...(deo_details || {}),
          ...(vtp_details || {}),
          role: frontendRole,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        };

        login(loggedInUser);
        toast.success(`Welcome back, ${user.name}!`);
        navigate(ROLE_DASHBOARDS[frontendRole] || '/');
      } else {
        toast.error(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      toast.error(serverMsg || 'Login failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to your account to continue managing the platform"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

          {/* Email / Teacher Code — switches label for headmaster */}
          <AnimatePresence mode="wait">
            {isHeadmaster ? (
              <motion.div
                key="teacher-code"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <AuthInput
                  label="VT Code"
                  type="text"
                  icon={Code}
                  error={errors.email?.message}
                  autoComplete="off"
                  {...register('email')}
                />
              </motion.div>
            ) : (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <AuthInput
                  label="Email or Mobile Number"
                  type="text"
                  icon={Mail}
                  error={errors.email?.message}
                  autoComplete="email"
                  {...register('email')}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password / Mobile — switches label for headmaster */}
          <AnimatePresence mode="wait">
            {isHeadmaster ? (
              <motion.div
                key="mobile"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <AuthInput
                  label="Mobile Number"
                  type="tel"
                  icon={Phone}
                  error={errors.password?.message}
                  autoComplete="tel"
                  {...register('password')}
                />
              </motion.div>
            ) : (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <AuthInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  error={errors.password?.message}
                  autoComplete="current-password"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white/30 hover:text-white/60 transition-all duration-200 p-1.5 rounded-lg hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  {...register('password')}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Role Selector — dynamic from API */}
          <Controller
            name="role_id"
            control={control}
            render={({ field }) => (
              <RoleSelector
                value={field.value}
                onChange={field.onChange}
                error={errors.role_id?.message}
                roles={roles}
                isLoading={rolesLoading}
              />
            )}
          />

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" className="auth-checkbox" />
              <span className="text-xs text-white/40 group-hover:text-white/55 transition-colors font-medium">
                Remember me
              </span>
            </label>
            {!isHeadmaster && (
              <Link
                to="/forgot-password"
                className="text-xs text-violet-400/80 hover:text-violet-300 transition-colors font-semibold hover:underline underline-offset-2"
              >
                Forgot password?
              </Link>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading || rolesLoading}
            whileHover={{ scale: isLoading ? 1 : 1.01 }}
            whileTap={{ scale: isLoading ? 1 : 0.985 }}
            className={`
              auth-submit-btn w-full h-[52px] rounded-xl font-semibold text-sm tracking-wide
              flex items-center justify-center gap-2.5
              transition-all duration-300
              focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
              ${isLoading || rolesLoading
                ? 'bg-violet-600/30 text-white/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_100%] text-white cursor-pointer hover:bg-right hover:shadow-[0_8px_30px_rgba(139,92,246,0.35)]'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
                <ArrowRight className="w-3.5 h-3.5 ml-0.5 opacity-60" />
              </>
            )}
          </motion.button>

          {/* Security badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex items-center justify-center gap-2 pt-2"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 animate-pulse" />
              <span className="text-[10px] text-white/30 font-medium tracking-wide">
                Multi Role Login
              </span>
            </div>
          </motion.div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;