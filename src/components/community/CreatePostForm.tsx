'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { postDiscussionAction } from '@/lib/actions/communityActions';
import { toast } from 'sonner';
import { Loader2, Tag, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { text } from '@/lib/dictionary';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
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
    
    if (title.length < 5) return toast.error('Judul terlalu pendek.');
    if (content.length < 10) return toast.error('Konten terlalu pendek.');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('tags', tags);

    startTransition(async () => {
      const result = await postDiscussionAction(formData);
      if (result.success) {
        toast.success('Diskusi berhasil diposting!');
        setTitle('');
        setContent('');
        setTags('');
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || 'Gagal memposting diskusi.');
      }
    });
  };

  if (!authChecked) {
    return (
      <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-sm">
        <Loader2 className="h-6 w-6 animate-spin mb-2" />
        {text.common.checkingAuth}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-card border border-border border-dashed rounded-2xl min-h-[250px]">
        <Lock className="h-8 w-8 text-primary mb-3 opacity-80" />
        <h3 className="font-bold text-lg mb-1">{text.auth.authRequired}</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">
          {text.auth.loginToDiscuss}
        </p>
        <Link href={`/login?redirectTo=/community`} className="w-full max-w-xs">
          <Button className="w-full rounded-full shadow-lg shadow-primary/20">
            {text.nav.login}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">Judul</label>
        <Input
          id="title"
          placeholder="Apa yang ada di pikiran Anda?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isPending}
          className="bg-background/50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">Konten</label>
        <Textarea
          id="content"
          placeholder="Bagikan pemikiran, tips, atau ulasan Anda..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={isPending}
          className="min-h-[150px] bg-background/50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="tags" className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Tags (pisahkan dengan koma)
        </label>
        <Input
          id="tags"
          placeholder="Gear, Review, Turnamen..."
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={isPending}
          className="bg-background/50"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={isPending} 
          className="w-full sm:w-auto rounded-full px-8 h-12"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Buat Diskusi'
          )}
        </Button>
      </div>
    </form>
  );
}
