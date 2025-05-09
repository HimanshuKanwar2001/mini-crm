
'use client';

import type { FollowUpListItem } from '@/app/follow-ups/page'; // Adjusted import
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import Link from 'next/link'; // No longer navigating directly
import { format } from 'date-fns';
import { User, MessageSquare, CalendarClock, Eye } from 'lucide-react'; // Changed ExternalLink to Eye

interface FollowUpItemCardProps {
  item: FollowUpListItem;
  onViewDetails: (leadId: string) => void;
}

export function FollowUpItemCard({ item, onViewDetails }: FollowUpItemCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow bg-card flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <User className="h-5 w-5 mr-2 shrink-0 text-accent" />
            {item.leadName}
          </CardTitle>
          <Badge variant="secondary" className="text-xs whitespace-nowrap">{item.conversationType}</Badge>
        </div>
        <CardDescription className="flex items-center text-sm text-muted-foreground pt-1">
            <CalendarClock className="h-4 w-4 mr-1.5 shrink-0" />
            Follow-up: {format(item.followUpDate, 'MMM dd, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-3">
          <MessageSquare className="h-4 w-4 mr-1.5 inline-block shrink-0" />
          {item.conversationSummary}
        </p>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onViewDetails(item.leadId)}
          title={`View details for lead ${item.leadName}`}
        >
          <Eye className="mr-2 h-4 w-4" /> 
          View Lead & Conversation
        </Button>
      </CardFooter>
    </Card>
  );
}
