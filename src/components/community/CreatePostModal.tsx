'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MessageSquarePlus } from 'lucide-react';
import { CreatePostForm } from './CreatePostForm';

export function CreatePostModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        size="lg" 
        onClick={() => setIsOpen(true)}
        className="rounded-full shadow-lg hover:shadow-primary/20 transition-all"
      >
        <MessageSquarePlus className="mr-2 h-5 w-5" />
        New Discussion
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Start a New Discussion"
        description="Share your billiard insights with the JTT community."
        className="max-w-2xl"
      >
        <CreatePostForm onSuccess={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}
