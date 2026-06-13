'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { text } from '@/lib/dictionary';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 px-4 text-center">
      <div className="bg-red-500/10 p-4 rounded-full">
        <AlertTriangle className="w-12 h-12 text-red-500" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{text.errors.somethingWentWrong}</h2>
        <p className="text-muted-foreground max-w-[500px]">
          {text.errors.apology}
        </p>
      </div>
      
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors focus:ring-2 focus:ring-primary/50 focus:outline-none"
      >
        {text.errors.tryAgain}
      </button>
    </div>
  );
}
