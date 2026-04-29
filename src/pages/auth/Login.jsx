import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, LogIn, Loader2, Code, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { ROLE_DASHBOARDS } from '../../utils/constants';

import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
import RoleSelector from '../../components/auth/RoleSelector';
import api from '../../services/api';

// ─── Dynamic validation schema ───
// const loginSchema = z
//   .object({
//     email: z.string().min(1, 'Required field'),
//     password: z.string().min(1, 'Required field'),
//     role: z.enum(['admin', 'vtp', 'principal'], {
//       required_error: 'Please select a role',
//     }),
//   })
//   .superRefine(({ email, password, role }, ctx) => {
//     if (role === 'principal') {
//       // Teacher code – just require a non‑empty value
//       if (email.trim().length === 0) {
//         ctx.addIssue({
//           code: 'custom',
//           path: ['email'],
//           message: 'Teacher Code is required',
//         });
//       }
//       // Mobile – 10 digits only
//       if (!/^\d{10}$/.test(password)) {
//         ctx.addIssue({
//           code: 'custom',
//           path: ['password'],
//           message: 'Enter a valid 10‑digit mobile number',
//         });
//       }
//     } else {
//       // Admin / VTP – standard email + password
//       if (!/^\S+@\S+\.\S+$/.test(email)) {
//         ctx.addIssue({
//           code: 'custom',
//           path: ['email'],
//           message: 'Invalid email address',
//         });
//       }
//       if (password.length < 6) {
//         ctx.addIssue({
//           code: 'custom',
//           path: ['password'],
//           message: 'Password must be at least 6 characters',
//         });
//       }
//     }
//   });

const loginSchema = z
  .object({
    email: z.string().min(1, 'Required field'),
    password: z.string().min(1, 'Required field'),
    role: z.enum(['admin', 'vtp', 'principal', 'deo'], {
      required_error: 'Please select a role',
    }),
  })
  .superRefine(({ email, password, role }, ctx) => {
    // Only apply format checks for admin & vtp
    if (role !== 'principal') {
      // Admin / VTP – standard email + password
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        ctx.addIssue({
          code: 'custom',
          path: ['email'],
          message: 'Invalid email address',
        });
      }
      if (password.length < 6) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'Password must be at least 6 characters',
        });
      }
    }
    // For principal, no extra validation – any non‑empty string is accepted
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
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'admin',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const isPrincipal = selectedRole === 'principal';
      const apiRole = isPrincipal ? 'headmaster' : data.role;

      const payload = isPrincipal
        ? { teacher_code: data.email, mobile: data.password, role: apiRole }
        : { email: data.email, password: data.password, role: apiRole };

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await api.post(`${baseUrl}/auth/login`, payload);
      const result = response.data;

      if (result.status) {
        const { user, tokens } = result.data;
        const loggedInUser = {
          ...user,
          // Normalize backend role 'headmaster' → 'principal' for frontend route guards
          role: isPrincipal ? 'principal' : user.role,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        };
        login(loggedInUser);
        toast.success(`Welcome back, ${user.name}!`);
        navigate(ROLE_DASHBOARDS[data.role] || '/');
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
          {/* First field – changes with role */}
          {selectedRole === 'principal' ? (
            <AuthInput
              label="Teacher Code"
              type="text"
              icon={Code}
              error={errors.email?.message}
              autoComplete="off"
              {...register('email')}
            />
          ) : (
            <AuthInput
              label="Email address"
              type="email"
              icon={Mail}
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />
          )}

          {/* Second field – changes with role */}
          {selectedRole === 'principal' ? (
            <AuthInput
              label="Mobile Number"
              type="tel"
              icon={Phone}
              error={errors.password?.message}
              autoComplete="tel"
              {...register('password')}
            />
          ) : (
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
          )}

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

          {/* Remember me + Forgot password (hidden for principal) */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="auth-checkbox" />
              <span className="text-xs text-white/40 group-hover:text-white/55 transition-colors font-medium">
                Remember me
              </span>
            </label>
            {selectedRole !== 'principal' && (
              <Link
                to="/forgot-password"
                className="text-xs text-violet-400/80 hover:text-violet-300 transition-colors font-medium"
              >
                Forgot password?
              </Link>
            )}
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