
'use client';

import type { CalendarFollowUpEvent } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { User, MessageSquare } from 'lucide-react';

interface FollowUpEventItemProps {
  event: CalendarFollowUpEvent;
  onSelectEvent: (event: CalendarFollowUpEvent) => void;
  isSelected: boolean;
}

export function FollowUpEventItem({ event, onSelectEvent, isSelected }: FollowUpEventItemProps) {
  return (
    <Card 
      className={`mb-2 p-2 cursor-pointer hover:shadow-md transition-shadow text-xs ${isSelected ? 'ring-2 ring-accent shadow-lg' : 'shadow-sm'}`}
      onClick={() => onSelectEvent(event)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectEvent(event);}}
      aria-pressed={isSelected}
      aria-label={`Follow up with ${event.leadName}, ${event.conversationType} on ${format(event.date, 'MMM d')}. Summary: ${event.conversationSummary.substring(0,50)}...`}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold text-foreground truncate flex items-center">
          <User className="h-3 w-3 mr-1 shrink-0" /> 
          {event.leadName}
        </p>
        <Badge variant="secondary" className="text-xs whitespace-nowrap">{event.conversationType}</Badge>
      </div>
      <p className="text-muted-foreground line-clamp-2">
        <MessageSquare className="h-3 w-3 mr-1 inline-block shrink-0" />
        {event.conversationSummary}
      </p>
    </Card>
  );
}
