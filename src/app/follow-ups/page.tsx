
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Lead, Conversation } from '@/types'; // Removed ConversationType import as it's already in types
import { getLeads, addConversationToLead } from '@/actions/leadActions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FollowUpItemCard } from '@/components/follow-ups/FollowUpItemCard';
import { ConversationDialog } from '@/components/conversations/ConversationDialog';
import type { ConversationFormValues } from '@/components/conversations/ConversationForm';
import { RefreshCw, BellRing, AlertTriangle } from 'lucide-react';
import { parseISO, startOfDay, compareAsc, isToday, isTomorrow, isFuture } from 'date-fns';

// Re-defined FollowUpListItem to avoid dependency on deleted calendar types if any
export interface FollowUpListItem {
  id: string; 
  leadId: string;
  leadName: string;
  conversationId: string;
  conversationType: Lead['conversations'][0]['type']; // Use ConversationType from types
  conversationSummary: string;
  followUpDate: Date; 
  originalConversation: Conversation; 
}


export default function FollowUpsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedLeadForDialog, setSelectedLeadForDialog] = useState<Lead | null>(null);
  const [isConversationDialogOpen, setIsConversationDialogOpen] = useState(false);
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
              id: `${lead.id}-${convo.id}`, // Unique ID for the list item
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

  const handleViewLeadDetails = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLeadForDialog(lead);
      setIsConversationDialogOpen(true);
    } else {
      toast({ title: "Error", description: "Lead details not found.", variant: "destructive" });
    }
  };

  const handleLogConversationInDialog = async (leadId: string, values: ConversationFormValues) => {
    try {
      const updatedLead = await addConversationToLead(leadId, values);
      if (updatedLead) {
        // Re-fetch leads to update the list with new conversation or changed follow-up
        const leadsData = await getLeads();
        setLeads(leadsData);
        // Update the selected lead in the dialog if it's the one being modified
        if (selectedLeadForDialog && selectedLeadForDialog.id === leadId) {
          setSelectedLeadForDialog(leadsData.find(l => l.id === leadId) || null);
        }
        toast({ title: "Conversation Logged", description: "Successfully logged conversation." });
      } else {
        toast({ title: "Error", description: "Failed to log conversation.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error logging conversation from dialog:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Error", description: `Failed to log conversation: ${errorMessage}`, variant: "destructive" });
    }
  };

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
                    <FollowUpItemCard key={item.id} item={item} onViewDetails={handleViewLeadDetails} />
                  ))}
                </div>
              </section>
            )}
            {categorizedFollowUps.tomorrow.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary border-b pb-2">Tomorrow</h2>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categorizedFollowUps.tomorrow.map(item => (
                    <FollowUpItemCard key={item.id} item={item} onViewDetails={handleViewLeadDetails} />
                  ))}
                </div>
              </section>
            )}
            {categorizedFollowUps.upcoming.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-muted-foreground border-b pb-2">Upcoming</h2>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categorizedFollowUps.upcoming.map(item => (
                    <FollowUpItemCard key={item.id} item={item} onViewDetails={handleViewLeadDetails} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>
      )}

      <ConversationDialog
        lead={selectedLeadForDialog}
        open={isConversationDialogOpen}
        onOpenChange={(open) => {
          setIsConversationDialogOpen(open);
          if (!open) {
            setSelectedLeadForDialog(null);
          }
        }}
        onLogConversation={handleLogConversationInDialog}
      />
    </div>
  );
}
