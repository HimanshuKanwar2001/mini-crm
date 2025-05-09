
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Lead, Conversation, FollowUpListItem } from '@/types';
import { getLeads } from '@/actions/leadActions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FollowUpItemCard } from '@/components/follow-ups/FollowUpItemCard';
import { RefreshCw, BellRing, AlertTriangle } from 'lucide-react';
import { parseISO, startOfDay, compareAsc, isPast, isToday, isTomorrow, isFuture } from 'date-fns';

// Re-defined FollowUpListItem to avoid dependency on deleted calendar types if any
export interface FollowUpListItem {
  id: string; 
  leadId: string;
  leadName: string;
  conversationId: string;
  conversationType: ConversationType;
  conversationSummary: string;
  followUpDate: Date; 
  originalConversation: Conversation; 
}


export default function FollowUpsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadLeadsData() {
      try {
        const leadsData = await getLeads();
        setLeads(leadsData);
      } catch (error) {
        console.error("Failed to load leads for follow-ups:", error);
        toast({ title: "Error", description: "Failed to load lead data.", variant: "destructive" });
      }
      setIsMounted(true);
    }
    loadLeadsData();
  }, [toast]);

  const upcomingFollowUps = useMemo<FollowUpListItem[]>(() => {
    if (!leads) return [];
    const followUps: FollowUpListItem[] = [];
    leads.forEach(lead => {
      lead.conversations.forEach(convo => {
        if (convo.followUpReminderDate) {
          const followUpDate = startOfDay(parseISO(convo.followUpReminderDate));
          // Only include future or today's follow-ups
          if (isFuture(followUpDate) || isToday(followUpDate)) {
            followUps.push({
              id: `${lead.id}-${convo.id}`,
              leadId: lead.id,
              leadName: lead.name,
              conversationId: convo.id,
              conversationType: convo.type,
              conversationSummary: convo.summary,
              followUpDate: followUpDate,
              originalConversation: convo,
            });
          }
        }
      });
    });
    return followUps.sort((a, b) => compareAsc(a.followUpDate, b.followUpDate));
  }, [leads]);

  const categorizedFollowUps = useMemo(() => {
    const today: FollowUpListItem[] = [];
    const tomorrow: FollowUpListItem[] = [];
    const upcoming: FollowUpListItem[] = [];

    upcomingFollowUps.forEach(item => {
      if (isToday(item.followUpDate)) {
        today.push(item);
      } else if (isTomorrow(item.followUpDate)) {
        tomorrow.push(item);
      } else {
        upcoming.push(item);
      }
    });
    return { today, tomorrow, upcoming };
  }, [upcomingFollowUps]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <RefreshCw className="h-10 w-10 animate-spin text-accent" />
        <p className="ml-3 text-lg text-muted-foreground">Loading Follow-ups...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <BellRing className="mr-3 h-8 w-8" /> Upcoming Follow-ups
        </h1>
      </div>

      {upcomingFollowUps.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-50" />
            No upcoming follow-up reminders found.
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-16rem)] rounded-md">
          <div className="space-y-6">
            {categorizedFollowUps.today.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-accent border-b pb-2">Today</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categorizedFollowUps.today.map(item => (
                    <FollowUpItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
            {categorizedFollowUps.tomorrow.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary border-b pb-2">Tomorrow</h2>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categorizedFollowUps.tomorrow.map(item => (
                    <FollowUpItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
            {categorizedFollowUps.upcoming.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-muted-foreground border-b pb-2">Upcoming</h2>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categorizedFollowUps.upcoming.map(item => (
                    <FollowUpItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
