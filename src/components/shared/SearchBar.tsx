import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export function SearchBar({ className, onSearch, ...props }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <Input
        type="text"
        placeholder="Search premium cues..."
        className="pl-10 pr-4 h-12 rounded-2xl bg-card border-border shadow-sm w-full"
        onChange={(e) => onSearch && onSearch(e.target.value)}
        {...props}
      />
    </div>
  );
}

export function FilterBar({ onOpenFilter }: { onOpenFilter?: () => void }) {
  return (
    <Button 
      variant="outline" 
      className="h-12 rounded-2xl px-5 border-border bg-card shadow-sm hover:bg-muted"
      onClick={onOpenFilter}
    >
      <SlidersHorizontal className="mr-2 h-4 w-4" />
      Filters
    </Button>
  );
}
