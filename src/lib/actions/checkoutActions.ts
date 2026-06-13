'use server';

import { createClient } from '@/lib/supabase/server';

export type SellerInfo = {
  id: string;
  name: string;
  whatsapp_number: string | null;
};

export async function getSellersInfo(sellerIds: string[]): Promise<SellerInfo[]> {
  if (!sellerIds.length) return [];
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, whatsapp_number')
    .in('id', sellerIds);

  if (error || !data) {
    console.error('Error fetching seller info:', error);
    return [];
  }

  return data.map(d => ({
    id: d.id,
    name: d.full_name,
    whatsapp_number: d.whatsapp_number
  }));
}
