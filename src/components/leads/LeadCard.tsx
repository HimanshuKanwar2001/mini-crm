
'use client';

import type { Lead } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadActions } from './LeadActions';
import { Mail, Briefcase, GripVertical } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onViewConversations: (lead: Lead) => void;
  onGetAISuggestions: (lead: Lead) => void;
}

export function LeadCard({
  lead,
  onEdit,
  onDelete,
  onViewConversations,
  onGetAISuggestions,
}: LeadCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-card">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-foreground">{lead.name}</CardTitle>
          {/* Optional: Drag handle icon for future dnd */}
          {/* <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" /> */}
        </div>
        {lead.company && (
          <CardDescription className="flex items-center text-sm text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
            {lead.company}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-4 space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5 mr-1.5" />
          <span>{lead.email}</span>
        </div>
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {lead.tags.slice(0, 3).map((tag, index) => ( // Show max 3 tags
              <Badge key={`${lead.id}-tag-${index}`} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {lead.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{lead.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end pt-0">
        <LeadActions
          lead={lead}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewConversations={onViewConversations}
          onGetAISuggestions={onGetAISuggestions}
        />
      </CardFooter>
    </Card>
  );
}
