import type { Conversation } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CalendarClock, StickyNote } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  leadName: string;
}

export function ConversationList({ conversations, leadName }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <StickyNote className="mx-auto h-12 w-12 mb-4" />
        <p>No conversations logged yet for {leadName}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Conversations with {leadName}</h3>
      {conversations
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by most recent
        .map((convo) => (
        <Card key={convo.id} className="shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{convo.type}</CardTitle>
                <CardDescription>{format(new Date(convo.date), 'MMMM dd, yyyy - p')}</CardDescription>
              </div>
              <Badge variant="secondary">{convo.type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">{convo.summary}</p>
            {convo.customNotes && (
              <div className="mt-2 p-3 bg-muted/50 rounded-md">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Additional Notes:</p>
                <p className="text-sm">{convo.customNotes}</p>
              </div>
            )}
          </CardContent>
          {convo.followUpReminderDate && (
            <CardFooter className="text-xs text-accent">
              <CalendarClock className="h-4 w-4 mr-2" />
              Follow-up reminder set for: {format(new Date(convo.followUpReminderDate), 'MMMM dd, yyyy')}
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
