'use client';

import React, { useActionState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateProfileAction } from '@/lib/auth/actions';
import { toast } from 'sonner';
import { User, Loader2, Save } from 'lucide-react';

interface ProfileFormClientProps {
  profile: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    whatsapp_number?: string | null;
  };
}

const initialState = { error: '', success: '' };

export function ProfileFormClient({ profile }: ProfileFormClientProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.success) {
      toast.success(state.success);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Avatar Preview (Read Only for now, could be expanded later) */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-primary/10 border-4 border-background shadow-lg mb-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="object-cover h-full w-full" />
          ) : (
            <User className="h-10 w-10 absolute inset-0 m-auto text-primary" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">Foto profil diambil dari akun Google Anda.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="full_name" className="text-sm font-semibold">Nama Lengkap</label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={profile.full_name || ''}
            placeholder="Masukkan nama lengkap Anda"
            required
            className="h-12 bg-background"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-semibold">Username</label>
          <Input
            id="username"
            name="username"
            defaultValue={profile.username || ''}
            placeholder="Pilih username unik"
            required
            className="h-12 bg-background"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="whatsapp_number" className="text-sm font-semibold flex items-center gap-2">
            Nomor WhatsApp
            {!profile.whatsapp_number && (
              <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                Wajib untuk Jual Beli
              </span>
            )}
          </label>
          <Input
            id="whatsapp_number"
            name="whatsapp_number"
            defaultValue={profile.whatsapp_number || ''}
            placeholder="Contoh: 081234567890 atau 6281234567890"
            className="h-12 bg-background"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Nomor ini akan digunakan oleh pembeli untuk menghubungi Anda saat melakukan pesanan produk.
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-border mt-8 flex justify-end">
        <Button 
          type="submit" 
          disabled={isPending}
          className="rounded-full shadow-lg shadow-primary/20 px-8"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
