'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { MdLogin } from 'react-icons/md';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useRouter } from 'next/navigation';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { FormError } from '@/shared/components/ui/FormError';
import { getApiError } from '@/shared/utils/error';
import { getAuthTokenClaims } from '@/shared/utils/auth-token';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().nonempty('Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw errorData;
      }

      const { user, accessToken } = await response.json();

      const { companyId, role } = accessToken
        ? getAuthTokenClaims(accessToken)
        : { companyId: null, role: null };

      setAuth(user, companyId, role);

      switch (user.userType) {
        case 'EMPLOYER':
          router.push('/dashboard/company');
          break;

        case 'CANDIDATE':
          router.push('/dashboard/profile');
          break;

        case 'PLATFORM_ADMIN':
          router.push('/dashboard/admin');
          break;
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: getApiError(
          error,
          'Invalid email or password. Please try again.',
        ),
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div>
        {/* Status pill */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase text-primary tracking-wider font-semibold">
            Precision Manufacturing Network
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Matching Live
          </span>
        </div>

        <h2 className="font-headline text-2xl sm:text-3xl text-foreground font-medium tracking-tight">
          Sign In to Technically
        </h2>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Access your profile, connect with hiring managers, and view active
          industrial roles.
        </p>

        {/* Divider */}
        <div className="relative flex py-5 items-center mt-7">
          <div className="grow border-t border-border"></div>
          <span className="shrink mx-4 text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
            Sign In with email
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

          <FormError message={errors.root?.message} className="mb-2" />

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
        <span>By continuing, you agree to Technically&apos;s </span>
        <Link href="/terms" className="underline hover:text-primary transition">
          Terms of Service
        </Link>
        <span> and </span>
        <Link
          href="/privacy"
          className="underline hover:text-primary transition"
        >
          Privacy Policy
        </Link>
        .
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
};
