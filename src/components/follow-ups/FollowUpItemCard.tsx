
'use client';

import type { FollowUpListItem } from '@/app/follow-ups/page'; // Adjusted import
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { User, MessageSquare, CalendarClock, ExternalLink } from 'lucide-react';

interface FollowUpItemCardProps {
  item: FollowUpListItem;
}

export function FollowUpItemCard({ item }: FollowUpItemCardProps) {
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
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/?leadId=${item.leadId}#conversation-${item.conversationId}`} title={`View conversation details for ${item.leadName}`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Lead & Conversation
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
