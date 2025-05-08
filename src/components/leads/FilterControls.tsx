'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { leadStatusOptions, type LeadStatus } from '@/data/mock';
import { Search, Filter } from 'lucide-react';

interface FilterControlsProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  statusFilter: LeadStatus | 'all';
  onStatusFilterChange: (status: LeadStatus | 'all') => void;
}

export function FilterControls({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
}: FilterControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, email, company, or tag..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as LeadStatus | 'all')}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {leadStatusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
