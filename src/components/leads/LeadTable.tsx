
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '@/types';
import { LeadActions } from './LeadActions';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface LeadTableProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onViewConversations: (lead: Lead) => void;
  onGetAISuggestions: (lead: Lead) => void;
}

export function LeadTable({
  leads,
  onEditLead,
  onDeleteLead,
  onViewConversations,
  onGetAISuggestions,
}: LeadTableProps) {
  if (leads.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No leads found. Add your first lead to get started!</p>;
  }

  const handleRowClick = (lead: Lead, event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
    // Ensure the click is not on an interactive element within the row (like the actions button)
    const target = event.target as HTMLElement;
    if (target.closest('button, a, [role="menu"], [role="menuitem"]')) {
      return;
    }
    onEditLead(lead);
  };

  return (
    <div className="rounded-md border shadow-sm bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow 
              key={lead.id} 
              onClick={(e) => handleRowClick(lead, e)}
              className="cursor-pointer hover:bg-muted/60"
            >
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.company || '-'}</TableCell>
              <TableCell>
                <Badge variant={lead.status === 'Converted' ? 'default' : lead.status === 'Lost' ? 'destructive' : 'secondary'}>
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell className="space-x-1">
                {lead.tags.length > 0 ? lead.tags.slice(0, 2).map((tag, index) => ( // Show fewer tags for brevity
                  <Badge key={`${lead.id}-tag-${index}`} variant="outline">
                    {tag}
                  </Badge>
                )) : '-'}
                {lead.tags.length > 2 && (
                  <Badge variant="outline">+{lead.tags.length - 2}</Badge>
                )}
              </TableCell>
              <TableCell>{format(new Date(lead.updatedAt), 'MMM dd, yyyy')}</TableCell>
              <TableCell className="text-right">
                <LeadActions
                  lead={lead}
                  onEdit={onEditLead}
                  onDelete={onDeleteLead}
                  onViewConversations={onViewConversations}
                  onGetAISuggestions={onGetAISuggestions}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

