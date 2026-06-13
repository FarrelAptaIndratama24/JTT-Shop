'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { loginAction, type AuthState } from '@/lib/auth/actions';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { text } from '@/lib/dictionary';

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    loginAction,
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
      {/* Card */}
      <div className="relative bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-8 shadow-2xl shadow-black/20">
        {/* Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <LogIn className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{text.auth.welcomeBack}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {text.auth.signInSubtitle}
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
                placeholder="••••••••"
                autoComplete="current-password"
                required
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
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 rounded-xl shadow-lg shadow-primary/20"
            disabled={pending}
          >
            {pending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {text.auth.signingIn}</>
            ) : (
              <><LogIn className="mr-2 h-4 w-4" /> {text.auth.signIn}</>
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {text.auth.noAccount}{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            {text.auth.createAccount}
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
