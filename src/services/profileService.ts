import { createClient } from '@/lib/supabase/client';

export async function getSellerWhatsApp(sellerId: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('whatsapp_number')
    .eq('id', sellerId)
    .single();

  if (error || !data) {
    return null;
  }
  return data.whatsapp_number;
}
