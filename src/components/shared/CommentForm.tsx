'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { postCommentAction } from '@/lib/actions/communityActions';
import { toast } from 'sonner';
import { Send, Loader2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { text } from '@/lib/dictionary';

interface CommentFormProps {
  product_id?: string;
  community_post_id?: string;
  parent_id?: string;
  revalidateUrl: string;
  onSuccess?: () => void;
  /** Show a "Batal" button beside the submit button */
  onCancel?: () => void;
  /** Whether to render the cancel button */
  showCancelButton?: boolean;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CommentForm({
  product_id,
  community_post_id,
  parent_id,
  revalidateUrl,
  onSuccess,
  onCancel,
  showCancelButton = false,
  className,
  placeholder = "Write a comment...",
  autoFocus = false
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthChecked(true);
    }).catch(() => {
      setAuthChecked(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const formData = new FormData();
    formData.append('content', content);
    if (product_id) formData.append('product_id', product_id);
    if (community_post_id) formData.append('community_post_id', community_post_id);
    if (parent_id) formData.append('parent_id', parent_id);
    formData.append('revalidateUrl', revalidateUrl);

    startTransition(async () => {
      const result = await postCommentAction(formData);
      if (result.success) {
        setContent('');
        toast.success(parent_id ? 'Balasan dikirim!' : 'Komentar dikirim!');
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || 'Gagal mengirim komentar.');
      }
    });
  };

  if (!authChecked) {
    return (
      <div className="h-20 flex items-center justify-center text-muted-foreground text-sm">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        {text.common.checkingAuth}
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center text-center p-6 bg-card border border-border border-dashed rounded-2xl",
        className
      )}>
        <Lock className="h-5 w-5 text-primary mb-2 opacity-80" />
        <p className="text-muted-foreground text-sm mb-3">
          {text.community.loginToComment}
        </p>
        <Link href={`/login?redirectTo=${encodeURIComponent(revalidateUrl)}`}>
          <Button size="sm" className="rounded-full px-6 shadow-md shadow-primary/20">
            {text.nav.login}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[100px] bg-background/50 border-border focus:ring-primary/20"
        autoFocus={autoFocus}
        disabled={isPending}
      />
      <div className="flex items-center justify-end gap-2">
        {/* Cancel button — optional, shown when the form is opened via toggle */}
        {showCancelButton && onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full px-5 text-muted-foreground"
            onClick={onCancel}
            disabled={isPending}
          >
            {text.common.cancel}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isPending || !content.trim()}
          size="sm"
          className="rounded-full px-6"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {parent_id ? text.community.reply : text.community.postComment}
        </Button>
      </div>
    </form>
  );
}
