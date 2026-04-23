import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, LogIn, Loader2, School } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { getDashboardPath } from '../../utils/constants';
import { login as loginRequest } from '../../services/authService';

import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';

const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await loginRequest({
        phone: Number(data.phone),
        password: data.password,
      });

      const authenticatedUser = response?.data?.user;
      const accessToken = response?.data?.tokens?.access_token;
      const refreshToken = response?.data?.tokens?.refresh_token;
      const dashboardPath = getDashboardPath(authenticatedUser?.role);

      if (!authenticatedUser || !accessToken || dashboardPath === '/login') {
        logout();
        toast.error('This account role is not supported in the frontend.');
        return;
      }

      login(authenticatedUser, accessToken, refreshToken);
      navigate(dashboardPath, { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        headerContent={
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-500/20">
              <School className="h-8 w-8" />
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-gray-950 dark:text-white">
                Kushal Chhattisgarh
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                Skill Development Portal
              </p>
            </div>
          </div>
        }
        title="Welcome back"
        subtitle="Sign in to your account to continue"
        footer={
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Create one
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <AuthInput
            label="Phone number"
            type="tel"
            icon={Phone}
            error={errors.phone?.message}
            autoComplete="tel"
            inputMode="numeric"
            maxLength={10}
            {...register('phone')}
          />

          <AuthInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            icon={Lock}
            error={errors.password?.message}
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="rounded p-1 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 dark:text-gray-500 dark:hover:text-gray-300"
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

          <div className="flex items-center justify-between pt-1">
            <label className="group flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="auth-checkbox" />
              <span className="text-xs font-medium text-gray-500 transition-colors group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300">
                Remember me
              </span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Forgot password?
            </Link>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.015 }}
            whileTap={{ scale: isLoading ? 1 : 0.985 }}
            className={`
              flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-sm font-semibold tracking-wide
              transition-all duration-300
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
              ${
                isLoading
                  ? 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                  : 'cursor-pointer bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-500/20 hover:from-primary-700 hover:to-accent-700'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
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
