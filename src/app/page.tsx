/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { mockLeads } from '@/data/mock'; 
import { suggestNextSteps } from '@/ai/flows/suggest-next-steps';
import type { SuggestNextStepsInput } from '@/ai/schemas/next-steps-schemas';
import { PlusCircle, RefreshCw, List, LayoutGrid } from 'lucide-react';

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
    const storedLeads = localStorage.getItem('leads');
    if (storedLeads) {
      setLeads(JSON.parse(storedLeads));
    } else {
      setLeads(mockLeads);
    }

    const storedActivities = localStorage.getItem('activitiesLog');
    if (storedActivities) {
      setActivities(JSON.parse(storedActivities));
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('leads', JSON.stringify(leads));
      localStorage.setItem('activitiesLog', JSON.stringify(activities));
    }
  }, [leads, activities, isMounted]);

  const addActivityEntry = (
    type: ActivityType,
    leadData: Pick<Lead, 'id' | 'name'>,
    description: string,
    details?: Activity['details']
  ) => {
    const newActivity: Activity = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      description,
      leadId: leadData.id,
      leadName: leadData.name,
      details,
    };
    setActivities(prevActivities => [newActivity, ...prevActivities].slice(0, 200)); // Keep last 200 activities
  };

  const handleSaveLead = (values: LeadFormValues, id?: string) => {
    const processedTags = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    if (id) { 
      const originalLead = leads.find(l => l.id === id);
      if (!originalLead) return;

      const updatedLead = { ...originalLead, ...values, tags: processedTags, updatedAt: new Date().toISOString() };
      setLeads(leads.map(lead => 
        lead.id === id ? updatedLead : lead
      ));
      toast({ title: "Lead Updated", description: `${values.name} has been updated successfully.` });
      
      addActivityEntry("LEAD_UPDATED", updatedLead, `Details for lead '${updatedLead.name}' were updated.`);
      if (originalLead.status !== updatedLead.status) {
        addActivityEntry("STATUS_CHANGED", updatedLead, `Status of lead '${updatedLead.name}' changed from '${originalLead.status}' to '${updatedLead.status}'.`, { fieldName: 'status', oldValue: originalLead.status, newValue: updatedLead.status });
      }
    } else { 
      const newLead: Lead = {
        id: String(Date.now()), 
        ...values,
        tags: processedTags,
        status: values.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        conversations: [],
      };
      setLeads([newLead, ...leads]);
      toast({ title: "Lead Added", description: `${values.name} has been added successfully.` });
      addActivityEntry("LEAD_CREATED", newLead, `Lead '${newLead.name}' was created.`);
    }
    setEditingLead(null); 
    setIsAddLeadDialogOpen(false); 
  };

  const handleDeleteLead = (leadId: string) => {
    const leadToDelete = leads.find(l => l.id === leadId);
    if (!leadToDelete) return;

    if (window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      setLeads(leads.filter(lead => lead.id !== leadId));
      toast({ title: "Lead Deleted", description: `Lead '${leadToDelete.name}' has been removed.`, variant: "destructive" });
      addActivityEntry("LEAD_DELETED", leadToDelete, `Lead '${leadToDelete.name}' was deleted.`);
    }
  };

  const handleLogConversation = (leadId: string, convoValues: ConversationFormValues) => {
    const leadForConvo = leads.find(l => l.id === leadId);
    if (!leadForConvo) return;

    const newConversation: Conversation = {
      id: String(Date.now()),
      ...convoValues,
      date: convoValues.date.toISOString(),
      followUpReminderDate: convoValues.followUpReminderDate?.toISOString(),
      createdAt: new Date().toISOString(),
    };
    setLeads(leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, conversations: [newConversation, ...lead.conversations].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), updatedAt: new Date().toISOString() } 
        : lead
    ));
    toast({ title: "Conversation Logged", description: `A new conversation for ${leadForConvo.name} has been logged.` });
    addActivityEntry("CONVERSATION_LOGGED", leadForConvo, `A '${newConversation.type}' conversation was logged for lead '${leadForConvo.name}'.`, { conversationType: newConversation.type });
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

  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    const leadToUpdate = leads.find(l => l.id === leadId);
    if (!leadToUpdate) return;
    
    const oldStatus = leadToUpdate.status;
    if (oldStatus === newStatus) return;


    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId
          ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() }
          : lead
      )
    );
    
    toast({
        title: "Lead Status Updated",
        description: `${leadToUpdate.name}'s status changed from '${oldStatus}' to ${newStatus}.`,
    });
    addActivityEntry("STATUS_CHANGED", leadToUpdate, `Status of lead '${leadToUpdate.name}' changed from '${oldStatus}' to '${newStatus}'.`, { fieldName: 'status', oldValue: oldStatus, newValue: newStatus });
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
          <AddEditLeadDialog onSave={handleSaveLead} open={isAddLeadDialogOpen} onOpenChange={setIsAddLeadDialogOpen} 
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
            setAiSuggestionsLead(lead);
          }}
        />
      ) : (
        <KanbanBoard
          leads={filteredLeads}
          onEditLead={(lead) => { setEditingLead(lead); setIsAddLeadDialogOpen(true); }}
          onDeleteLead={handleDeleteLead}
          onViewConversations={setViewingConversationsLead}
          onGetAISuggestions={(lead) => {
            setAiSuggestionsLead(lead);
          }}
          onLeadStatusChange={handleUpdateLeadStatus}
        />
      )}


      {editingLead && (
        <AddEditLeadDialog
          lead={editingLead}
          onSave={handleSaveLead}
          open={isAddLeadDialogOpen && !!editingLead} 
          onOpenChange={(open) => {
            if (!open) setEditingLead(null);
            setIsAddLeadDialogOpen(open);
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
