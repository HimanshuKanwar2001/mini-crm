/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { LeadTable } from '@/components/leads/LeadTable';
import { AddEditLeadDialog } from '@/components/leads/AddEditLeadDialog';
import { ConversationDialog } from '@/components/conversations/ConversationDialog';
import { AISuggestionsDialog } from '@/components/ai/AISuggestionsDialog';
import { FilterControls } from '@/components/leads/FilterControls';
import { KanbanBoard } from '@/components/leads/KanbanBoard'; 
import { useToast } from '@/hooks/use-toast';
import type { Lead, Conversation, LeadStatus, Activity, ActivityType } from '@/types';
import type { LeadFormValues } from '@/components/leads/LeadForm';
import type { ConversationFormValues } from '@/components/conversations/ConversationForm';
// mockLeads is no longer primary source, but can be kept for reference or testing
// import { mockLeads } from '@/data/mock'; 
import { suggestNextSteps } from '@/ai/flows/suggest-next-steps';
import type { SuggestNextStepsInput } from '@/ai/schemas/next-steps-schemas';
import { PlusCircle, RefreshCw, List, LayoutGrid } from 'lucide-react';
import { getLeads, createLead, updateLead, deleteLeadDb, addConversationToLead, updateLeadStatusDb } from '@/actions/leadActions';
import { getActivities as getActivitiesLog, createActivity } from '@/actions/activityActions';


export default function HomePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingConversationsLead, setViewingConversationsLead] = useState<Lead | null>(null);
  const [aiSuggestionsLead, setAiSuggestionsLead] = useState<Lead | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const [leadsData, activitiesData] = await Promise.all([
          getLeads(),
          getActivitiesLog()
        ]);
        setLeads(leadsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast({ title: "Error", description: "Failed to load data from server. Please ensure MongoDB is running and configured.", variant: "destructive" });
      }
      setIsMounted(true);
    }
    loadData();
  }, [toast]);

  const addActivityEntry = useCallback(async (
    type: ActivityType,
    leadData: Pick<Lead, 'id' | 'name'>,
    description: string,
    details?: Activity['details']
  ) => {
    try {
      const newActivity = await createActivity(type, leadData, description, details);
      setActivities(prevActivities => [newActivity, ...prevActivities].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error("Failed to log activity:", error);
      toast({ title: "Activity Log Error", description: "Could not save activity to database.", variant: "destructive" });
    }
  }, [toast]);

  const handleSaveLead = async (values: LeadFormValues, id?: string) => {
    try {
      if (id) { 
        const originalLeadFromState = leads.find(l => l.id === id);
        if (!originalLeadFromState) {
          toast({ title: "Error", description: "Original lead not found for update.", variant: "destructive" });
          return;
        }
        const originalStatus = originalLeadFromState.status;

        const updatedLeadData = await updateLead(id, values);
        if (updatedLeadData) {
          setLeads(currentLeads => currentLeads.map(lead => lead.id === id ? updatedLeadData : lead));
          toast({ title: "Lead Updated", description: `${values.name} has been updated successfully.` });
          
          // Activity logging is now primarily handled within updateLead, but we can keep this if specific frontend context is needed
          // await addActivityEntry("LEAD_UPDATED", updatedLeadData, `Details for lead '${updatedLeadData.name}' were updated.`);
          // if (originalStatus !== updatedLeadData.status) {
          //   await addActivityEntry("STATUS_CHANGED", updatedLeadData, `Status of lead '${updatedLeadData.name}' changed from '${originalStatus}' to '${updatedLeadData.status}'.`, { fieldName: 'status', oldValue: originalStatus, newValue: updatedLeadData.status });
          // }
        } else {
          toast({ title: "Error", description: "Failed to update lead in database.", variant: "destructive" });
        }
      } else { 
        const newLeadData = await createLead(values);
        setLeads(prevLeads => [newLeadData, ...prevLeads]);
        toast({ title: "Lead Added", description: `${values.name} has been added successfully.` });
        // Activity logging is handled by createLead
        // await addActivityEntry("LEAD_CREATED", newLeadData, `Lead '${newLeadData.name}' was created.`);
      }
    } catch (error) {
      console.error("Error saving lead:", error);
      toast({ title: "Database Error", description: "Could not save lead. " + (error instanceof Error ? error.message : ""), variant: "destructive" });
    }
    setEditingLead(null); 
    setIsAddLeadDialogOpen(false); 
  };

  const handleDeleteLead = async (leadId: string) => {
    const leadToDelete = leads.find(l => l.id === leadId);
    if (!leadToDelete) return;

    if (window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      try {
        const success = await deleteLeadDb(leadId);
        if (success) {
          setLeads(currentLeads => currentLeads.filter(lead => lead.id !== leadId));
          toast({ title: "Lead Deleted", description: `Lead '${leadToDelete.name}' has been removed.`, variant: "destructive" });
          // Activity logging handled by deleteLeadDb
          // await addActivityEntry("LEAD_DELETED", leadToDelete, `Lead '${leadToDelete.name}' was deleted.`);
        } else {
          toast({ title: "Error", description: "Failed to delete lead from database.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Error deleting lead:", error);
        toast({ title: "Database Error", description: "Could not delete lead. " + (error instanceof Error ? error.message : ""), variant: "destructive" });
      }
    }
  };

  const handleLogConversation = async (leadId: string, convoValues: ConversationFormValues) => {
    const leadForConvo = leads.find(l => l.id === leadId);
    if (!leadForConvo) {
      toast({ title: "Error", description: "Lead not found for conversation logging.", variant: "destructive" });
      return;
    }

    try {
      const updatedLead = await addConversationToLead(leadId, convoValues);
      if (updatedLead) {
        setLeads(currentLeads => currentLeads.map(lead => 
          lead.id === leadId ? updatedLead : lead
        ));
        toast({ title: "Conversation Logged", description: `A new conversation for ${leadForConvo.name} has been logged.` });
        // Activity logging handled by addConversationToLead
        // const loggedConversation = updatedLead.conversations[0]; 
        // await addActivityEntry("CONVERSATION_LOGGED", updatedLead, `A '${loggedConversation.type}' conversation was logged for lead '${updatedLead.name}'.`, { conversationType: loggedConversation.type });
      } else {
        toast({ title: "Error", description: "Failed to log conversation in database.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error logging conversation:", error);
      toast({ title: "Database Error", description: "Could not log conversation. " + (error instanceof Error ? error.message : ""), variant: "destructive" });
    }
  };
  
  const handleGetAISuggestions = async (lead: Lead) => {
    setAiSuggestionsLead(lead);
    setAiSuggestions([]);
    setIsAiLoading(true);
    setAiError(null);
    
    try {
      const communicationHistorySummary = lead.conversations.length > 0 
        ? lead.conversations
            .map(c => `${c.type} on ${new Date(c.date).toLocaleDateString()}: ${c.summary}`)
            .join('\n')
        : "No communication history yet.";

      const input: SuggestNextStepsInput = {
        leadName: lead.name,
        leadEmail: lead.email,
        leadLinkedInProfileUrl: lead.linkedinProfileUrl || '',
        company: lead.company || '',
        notes: lead.notes || '',
        tags: lead.tags,
        communicationHistory: communicationHistorySummary,
      };
      
      const result = await suggestNextSteps(input);
      setAiSuggestions(result.nextSteps);
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setAiError(`Failed to fetch AI suggestions: ${errorMessage}`);
      toast({ title: "AI Error", description: `Could not fetch suggestions. ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    const leadToUpdate = leads.find(l => l.id === leadId);
    if (!leadToUpdate) {
      toast({ title: "Error", description: "Lead not found for status update.", variant: "destructive" });
      return;
    }
    
    const oldStatus = leadToUpdate.status;
    if (oldStatus === newStatus) return;

    try {
      const updatedLead = await updateLeadStatusDb(leadId, newStatus);
      if (updatedLead) {
        setLeads(prevLeads =>
          prevLeads.map(lead =>
            lead.id === leadId ? updatedLead : lead
          )
        );
        toast({
            title: "Lead Status Updated",
            description: `${updatedLead.name}'s status changed from '${oldStatus}' to ${newStatus}.`,
        });
        // Activity logging handled by updateLeadStatusDb
        // await addActivityEntry("STATUS_CHANGED", updatedLead, `Status of lead '${updatedLead.name}' changed from '${oldStatus}' to '${newStatus}'.`, { fieldName: 'status', oldValue: oldStatus, newValue: newStatus });
      } else {
        toast({ title: "Error", description: "Failed to update lead status in database.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast({ title: "Database Error", description: "Could not update lead status. " + (error instanceof Error ? error.message : ""), variant: "destructive" });
    }
  };


  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearchTerm = searchTerm.toLowerCase() === '' ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lead.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatusFilter = statusFilter === 'all' || lead.status === statusFilter;
      
      return matchesSearchTerm && matchesStatusFilter;
    });
  }, [leads, searchTerm, statusFilter]);


  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <RefreshCw className="h-10 w-10 animate-spin text-accent" />
        <p className="ml-3 text-lg text-muted-foreground">Loading LeadPilot AI...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Leads</h1>
        <div className="flex gap-2 items-center">
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} onClick={() => setViewMode('table')} size="sm">
            <List className="mr-2 h-4 w-4" /> Table
          </Button>
          <Button variant={viewMode === 'kanban' ? 'default' : 'outline'} onClick={() => setViewMode('kanban')} size="sm">
            <LayoutGrid className="mr-2 h-4 w-4" /> Kanban
          </Button>
          <AddEditLeadDialog 
            onSave={handleSaveLead} 
            open={isAddLeadDialogOpen && !editingLead} // Open only if adding (editingLead is null)
            onOpenChange={(open) => {
              setIsAddLeadDialogOpen(open);
              if (!open) { // If closing, ensure editingLead is cleared if it was for an add operation
                setEditingLead(null);
              }
            }}
            triggerButton={
              <Button onClick={() => { setEditingLead(null); setIsAddLeadDialogOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Lead
              </Button>
            }
          />
        </div>
      </div>

      <FilterControls
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {viewMode === 'table' ? (
        <LeadTable
          leads={filteredLeads}
          onEditLead={(lead) => { setEditingLead(lead); setIsAddLeadDialogOpen(true); }}
          onDeleteLead={handleDeleteLead}
          onViewConversations={setViewingConversationsLead}
          onGetAISuggestions={(lead) => {
            setAiSuggestionsLead(lead); // This already opens the AISuggestionsDialog
          }}
        />
      ) : (
        <KanbanBoard
          leads={filteredLeads}
          onEditLead={(lead) => { setEditingLead(lead); setIsAddLeadDialogOpen(true); }}
          onDeleteLead={handleDeleteLead}
          onViewConversations={setViewingConversationsLead}
          onGetAISuggestions={(lead) => {
            setAiSuggestionsLead(lead); // This already opens the AISuggestionsDialog
          }}
          onLeadStatusChange={handleUpdateLeadStatus}
        />
      )}

      {/* Dialog for Editing an existing lead */}
      {editingLead && (
        <AddEditLeadDialog
          lead={editingLead}
          onSave={handleSaveLead}
          open={isAddLeadDialogOpen && !!editingLead} // Open only if editing (editingLead is not null)
          onOpenChange={(open) => {
            setIsAddLeadDialogOpen(open);
            if (!open) {
              setEditingLead(null); // Clear editingLead when dialog is closed
            }
          }}
        />
      )}

      <ConversationDialog
        lead={viewingConversationsLead}
        open={!!viewingConversationsLead}
        onOpenChange={(open) => { if (!open) setViewingConversationsLead(null); }}
        onLogConversation={handleLogConversation}
      />
      
      <AISuggestionsDialog
        lead={aiSuggestionsLead}
        suggestions={aiSuggestions}
        isLoading={isAiLoading}
        error={aiError}
        open={!!aiSuggestionsLead}
        onOpenChange={(open) => { if (!open) {setAiSuggestionsLead(null); setAiSuggestions([]); setAiError(null);}}}
        onFetchSuggestions={handleGetAISuggestions}
      />
    </div>
  );
}

