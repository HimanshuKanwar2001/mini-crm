'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { LeadTable } from '@/components/leads/LeadTable';
import { AddEditLeadDialog } from '@/components/leads/AddEditLeadDialog';
import { ConversationDialog } from '@/components/conversations/ConversationDialog';
import { AISuggestionsDialog } from '@/components/ai/AISuggestionsDialog';
import { FilterControls } from '@/components/leads/FilterControls';
import { useToast } from '@/hooks/use-toast';
import type { Lead, Conversation, LeadStatus } from '@/types';
import type { LeadFormValues } from '@/components/leads/LeadForm';
import type { ConversationFormValues } from '@/components/conversations/ConversationForm';
import { mockLeads } from '@/data/mock'; // Using mock data
import { suggestNextSteps, type SuggestNextStepsInput } from '@/ai/flows/suggest-next-steps';
import { PlusCircle, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
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

  const { toast } = useToast();

  useEffect(() => {
    // Load leads from local storage or use mock data
    const storedLeads = localStorage.getItem('leads');
    if (storedLeads) {
      setLeads(JSON.parse(storedLeads));
    } else {
      setLeads(mockLeads);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('leads', JSON.stringify(leads));
    }
  }, [leads, isMounted]);

  const handleSaveLead = (values: LeadFormValues, id?: string) => {
    const processedTags = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    if (id) { // Editing existing lead
      setLeads(leads.map(lead => 
        lead.id === id ? { ...lead, ...values, tags: processedTags, updatedAt: new Date().toISOString() } : lead
      ));
      toast({ title: "Lead Updated", description: `${values.name} has been updated successfully.` });
    } else { // Adding new lead
      const newLead: Lead = {
        id: String(Date.now()), // Simple ID generation
        ...values,
        tags: processedTags,
        status: values.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        conversations: [],
      };
      setLeads([newLead, ...leads]);
      toast({ title: "Lead Added", description: `${values.name} has been added successfully.` });
    }
    setEditingLead(null); // Close dialog after save
    setIsAddLeadDialogOpen(false); // Ensure add dialog closes too
  };

  const handleDeleteLead = (leadId: string) => {
    if (window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      setLeads(leads.filter(lead => lead.id !== leadId));
      toast({ title: "Lead Deleted", description: "The lead has been removed.", variant: "destructive" });
    }
  };

  const handleLogConversation = (leadId: string, convoValues: ConversationFormValues) => {
    const newConversation: Conversation = {
      id: String(Date.now()),
      ...convoValues,
      date: convoValues.date.toISOString(),
      followUpReminderDate: convoValues.followUpReminderDate?.toISOString(),
      createdAt: new Date().toISOString(),
    };
    setLeads(leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, conversations: [...lead.conversations, newConversation], updatedAt: new Date().toISOString() } 
        : lead
    ));
    toast({ title: "Conversation Logged", description: `A new conversation for ${viewingConversationsLead?.name} has been logged.` });
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
      setAiError("Failed to fetch AI suggestions. Please try again.");
      toast({ title: "AI Error", description: "Could not fetch suggestions.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
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
        <AddEditLeadDialog onSave={handleSaveLead} open={isAddLeadDialogOpen} onOpenChange={setIsAddLeadDialogOpen} 
         triggerButton={
            <Button onClick={() => { setEditingLead(null); setIsAddLeadDialogOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Lead
            </Button>
          }
        />
      </div>

      <FilterControls
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <LeadTable
        leads={filteredLeads}
        onEditLead={(lead) => { setEditingLead(lead); setIsAddLeadDialogOpen(true); }}
        onDeleteLead={handleDeleteLead}
        onViewConversations={setViewingConversationsLead}
        onGetAISuggestions={(lead) => {
          setAiSuggestionsLead(lead);
          // handleGetAISuggestions(lead); // Fetch on open through useEffect in AISuggestionsDialog
        }}
      />

      {editingLead && (
        <AddEditLeadDialog
          lead={editingLead}
          onSave={handleSaveLead}
          open={isAddLeadDialogOpen && !!editingLead} // only open if editingLead is set
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
