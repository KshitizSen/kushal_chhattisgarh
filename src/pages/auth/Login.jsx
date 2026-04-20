import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { ROLE_DASHBOARDS } from '../../utils/constants';

import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
import RoleSelector from '../../components/auth/RoleSelector';

// ─── Validation schema ───
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'vtp', 'principal'], {
    required_error: 'Please select a role',
  }),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'admin',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Simulate API call — replace with real authService.login()
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockUser = {
        id: '1',
        name:
          data.role === 'admin'
            ? 'Administrator'
            : data.role === 'vtp'
              ? 'Vocational Teacher'
              : 'Principal',
        email: data.email,
        role: data.role,
        avatar: `https://ui-avatars.com/api/?name=${data.email.split('@')[0]}&background=6366f1&color=fff`,
      };

      login(mockUser);
      // toast.success(`Welcome back, ${mockUser.name}!`);
      navigate(ROLE_DASHBOARDS[data.role] || '/');
    } catch {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to your account to continue"
        footer={
          <p className="text-sm text-white/40">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Email */}
          <AuthInput
            label="Email address"
            type="email"
            icon={Mail}
            error={errors.email?.message}
            autoComplete="email"
            {...register('email')}
          />

          {/* Password */}
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
                className="text-white/30 hover:text-white/60 transition-colors p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
            {...register('password')}
          />

          {/* Role Selector */}
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <RoleSelector
                value={field.value}
                onChange={field.onChange}
                error={errors.role?.message}
              />
            )}
          />

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="auth-checkbox" />
              <span className="text-xs text-white/40 group-hover:text-white/55 transition-colors font-medium">
                Remember me
              </span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-violet-400/80 hover:text-violet-300 transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.015 }}
            whileTap={{ scale: isLoading ? 1 : 0.985 }}
            className={`
              w-full h-12 rounded-xl font-semibold text-sm tracking-wide
              flex items-center justify-center gap-2.5
              transition-all duration-300
              focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
              ${isLoading
                ? 'bg-violet-600/50 text-white/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-glow-violet cursor-pointer'
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
              </>
            )}
          </motion.button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;