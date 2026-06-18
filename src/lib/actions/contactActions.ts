'use server';

import { createClient } from '@/lib/supabase/server';
import { contactMessageSchema } from '../validation';

export type ContactActionResponse = {
  success: boolean;
  error?: any;
};

export async function submitContactMessage(
  formData: FormData
): Promise<ContactActionResponse> {
  const first_name = String(formData.get('first_name') ?? '');
  const last_name = String(formData.get('last_name') ?? '');
  const email = String(formData.get('email') ?? '');
  const subject = String(formData.get('subject') ?? '');
  const message = String(formData.get('message') ?? '');

  // Validate with Zod schema
  const validationResult = contactMessageSchema.safeParse({
    first_name,
    last_name,
    email,
    subject,
    message,
  });

  if (!validationResult.success) {
    return { success: false, error: { message: validationResult.error.issues[0].message } };
  }

  const parsedData = validationResult.data;

  try {
    const supabase = await createClient();

    const payload = {
      first_name: parsedData.first_name,
      last_name: parsedData.last_name,
      email: parsedData.email,
      subject: parsedData.subject,
      message: parsedData.message,
      status: 'unread',
    };
    console.log("Payload:", payload);

    const { data, error } = await supabase.from('contact_messages').insert(payload).select();
    console.log("Data:", data);
    console.log("Error:", error);

    if (error) {
      console.error('[contact.submit] insert error:', error.message);
      return { success: false, error: error };
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
    console.error('[contact.submit] unexpected error:', errorMessage);
    return { success: false, error: { message: errorMessage } };
  }
}
