'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import { registerAction, type AuthState } from '@/lib/auth/actions';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { text } from '@/lib/dictionary';

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    registerAction,
    undefined
  );
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="relative bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-8 shadow-2xl shadow-black/20">
        {/* Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <UserPlus className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{text.auth.createAccount}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {text.auth.joinSubtitle}
          </p>
        </div>

        {/* Error Banner */}
        {state?.error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
          >
            {state.error}
          </motion.div>
        )}

        {/* Form */}
        <form action={action} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="full_name" className="text-sm font-medium">
              {text.auth.fullName}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                required
                className={cn(
                  'w-full h-11 pl-10 pr-4 rounded-xl bg-background/60 border border-border',
                  'text-sm placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60',
                  'transition-all duration-200'
                )}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {text.auth.email}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                className={cn(
                  'w-full h-11 pl-10 pr-4 rounded-xl bg-background/60 border border-border',
                  'text-sm placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60',
                  'transition-all duration-200'
                )}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {text.auth.password}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
                className={cn(
                  'w-full h-11 pl-10 pr-10 rounded-xl bg-background/60 border border-border',
                  'text-sm placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60',
                  'transition-all duration-200'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters long.
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 rounded-xl shadow-lg shadow-primary/20"
            disabled={pending}
          >
            {pending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {text.auth.creatingAccount}</>
            ) : (
              <><UserPlus className="mr-2 h-4 w-4" /> {text.auth.createAccount}</>
            )}
          </Button>
        </form>

        {/* Terms */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {text.auth.termsAgree}{' '}
          <span className="text-primary cursor-pointer hover:underline">{text.auth.termsOfService}</span>
          {' '}{text.auth.and}{' '}
          <span className="text-primary cursor-pointer hover:underline">{text.auth.privacyPolicy}</span>.
        </p>

        {/* Footer */}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {text.auth.haveAccount}{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            {text.auth.signIn}
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
