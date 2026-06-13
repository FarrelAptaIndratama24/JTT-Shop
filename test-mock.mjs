import { profileSchema } from './src/lib/validation.ts';

function simulateUpdate(formDataMap) {
  const rawFullName = String(formDataMap.get('full_name') ?? '');
  const rawUsername = String(formDataMap.get('username') ?? '');
  const rawWhatsapp = String(formDataMap.get('whatsapp_number') ?? '');
  
  let formattedWhatsapp = rawWhatsapp.trim();
  if (formattedWhatsapp.startsWith('0')) {
    formattedWhatsapp = '62' + formattedWhatsapp.slice(1);
  }

  const validationResult = profileSchema.safeParse({
    full_name: rawFullName,
    username: rawUsername,
    whatsapp_number: formattedWhatsapp,
  });

  if (!validationResult.success) {
    console.error("Validation failed", validationResult.error);
    return;
  }

  const parsedData = validationResult.data;

  const payload = {
    full_name: parsedData.full_name,
    username: parsedData.username,
    whatsapp_number: parsedData.whatsapp_number || null,
  };

  console.log("Simulated Payload:", payload);
}

const formDataMock = new Map([
  ['full_name', 'Ejey Shirami'],
  ['username', 'ejey'],
  ['whatsapp_number', '081234567890']
]);

simulateUpdate(formDataMock);
