"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button, Checkbox } from '@/shared/components/ui';
import { MdLogin } from 'react-icons/md';
import { useLogin } from '@/shared/api/generated/auth/auth';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useRouter } from 'next/navigation';
import { ForgotPasswordModal } from './ForgotPasswordModal';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
  keepSession: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const loginMutation = useLogin();
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      keepSession: true,
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginMutation.mutateAsync({
        data: {
          email: data.email,
          password: data.password,
        },
      });

      const { accessToken, user } = response.data;
      setAuth(accessToken, user);

      if (user.userType === 'EMPLOYER') {
        router.push('/dashboard/company');
      } else {
        router.push('/dashboard/profile');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Invalid email or password. Please try again.',
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div>
        {/* Status pill */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase text-primary tracking-wider font-semibold">
            Direct Placement Platform
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Matching Live
          </span>
        </div>
        
        <h1 className="font-headline text-3xl sm:text-4xl text-foreground font-medium tracking-tight">
          Sign In to Technically
        </h1>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Access your profile, connect with hiring managers, and view active industrial roles.
        </p>
        
        {/* Divider */}
        <div className="relative flex py-5 items-center mt-7">
          <div className="grow border-t border-border"></div>
          <span className="shrink mx-4 text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
            continue with email
          </span>
          <div className="grow border-t border-border"></div>
        </div>

        {/* Email & Password Form */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            placeholder="name@workshop.pro"
            {...register('email')}
            error={errors.email?.message}
          />
          
          {errors.root && (
            <div className="p-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-mono mb-2">
              {errors.root.message}
            </div>
          )}
          
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <button 
                type="button" 
                onClick={() => setIsForgotModalOpen(true)}
                className="text-[11px] text-primary hover:underline transition cursor-pointer"
              >
                Reset password
              </button>
            </div>
            <Input
              type="password"
              placeholder="••••••••••••"
              {...register('password')}
              error={errors.password?.message}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs pt-0.5">
            <Checkbox
              label="Keep me signed in"
              {...register('keepSession')}
            />
          </div>
          
          <Button 
            type="submit" 
            fullWidth 
            className="mt-2" 
            disabled={isSubmitting}
            rightIcon={<MdLogin className="text-sm" />}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </div>

      <div className="mt-4 pt-4 border-t border-border/40 text-center text-[10px] text-muted-foreground shrink-0 pb-2">
        By continuing, you agree to Technically&apos;s <a href="#" className="underline hover:text-primary transition">Terms of Service</a> and <a href="#" className="underline hover:text-primary transition">Privacy Policy</a>.
      </div>
      
      <ForgotPasswordModal 
        isOpen={isForgotModalOpen} 
        onClose={() => setIsForgotModalOpen(false)} 
      />
    </div>
  );
};
