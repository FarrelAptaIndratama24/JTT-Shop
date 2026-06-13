import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button, ButtonProps } from '../ui/Button';
import { STORE_CONFIG } from '@/lib/constants';

interface WhatsAppButtonProps extends ButtonProps {
  message?: string;
  phoneNumber?: string;
}

export function WhatsAppButton({ message = 'Hello JTT Shop!', phoneNumber, className, children, ...props }: WhatsAppButtonProps) {
  const encodedMessage = encodeURIComponent(message);
  const destination = phoneNumber || STORE_CONFIG.whatsappNumber;
  const url = `https://wa.me/${destination}?text=${encodedMessage}`;

  return (
    <Button
      asChild
      className={className}
      {...props}
    >
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center">
        <MessageCircle className="mr-2 h-4 w-4" />
        {children || 'Chat via WhatsApp'}
      </a>
    </Button>
  );
}
