
'use client';

import * as React from 'react';
import type { Lead, LeadStatus } from '@/types';
import { leadStatusOptions } from '@/data/mock';
import { LeadCard } from './LeadCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onViewConversations: (lead: Lead) => void;
  onGetAISuggestions: (lead: Lead) => void;
  onLeadStatusChange: (leadId: string, newStatus: LeadStatus) => void;
}

export function KanbanBoard({
  leads,
  onEditLead,
  onDeleteLead,
  onViewConversations,
  onGetAISuggestions,
  onLeadStatusChange,
}: KanbanBoardProps) {
  
  const [draggingOverColumn, setDraggingOverColumn] = React.useState<LeadStatus | null>(null);

  const groupedLeads = React.useMemo(() => 
    leadStatusOptions.reduce((acc, status) => {
      acc[status] = leads.filter(lead => lead.status === status);
      return acc;
    }, {} as Record<LeadStatus, Lead[]>)
  , [leads]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, newStatus: LeadStatus) => {
    event.preventDefault();
    const leadId = event.dataTransfer.getData('leadId');
    const currentStatus = event.dataTransfer.getData('currentStatus') as LeadStatus;
    
    if (leadId && newStatus !== currentStatus) {
      onLeadStatusChange(leadId, newStatus);
    }
    setDraggingOverColumn(null);
    event.currentTarget.classList.remove('drag-over-column');
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, status: LeadStatus) => {
    event.preventDefault();
    if (event.dataTransfer.types.includes('leadid')) { // Check if a lead is being dragged
        setDraggingOverColumn(status);
        event.currentTarget.classList.add('drag-over-column');
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>, status: LeadStatus) => {
    if (event.dataTransfer.types.includes('leadid')) {
      event.currentTarget.classList.add('drag-over-column');
    }
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    setDraggingOverColumn(null);
    event.currentTarget.classList.remove('drag-over-column');
  };


  if (leads.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No leads found to display in Kanban view.</p>;
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex gap-4 p-4 bg-muted/20 min-h-[calc(100vh-20rem)]">
        {leadStatusOptions.map((status) => (
          <div key={status} className="flex-shrink-0 w-[300px] sm:w-[320px] md:w-[350px]">
            <div 
              className={cn(
                "bg-card p-3 rounded-lg shadow h-full flex flex-col transition-colors duration-150 ease-in-out",
                draggingOverColumn === status && 'drag-over-column'
              )}
              onDragOver={(e) => handleDragOver(e, status)}
              onDrop={(e) => handleDrop(e, status)}
              onDragEnter={(e) => handleDragEnter(e, status)}
              onDragLeave={handleDragLeave}
            >
              <h2 className="text-lg font-semibold mb-4 px-1 text-foreground sticky top-0 bg-card py-2 z-10 border-b">
                {status} ({groupedLeads[status]?.length || 0})
              </h2>
              <ScrollArea className="flex-grow">
                <div className="space-y-3 pr-2 pb-2 min-h-[100px]"> {/* min-h to ensure drop target exists */}
                {groupedLeads[status] && groupedLeads[status].length > 0 ? (
                  groupedLeads[status].map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onEdit={onEditLead}
                      onDelete={onDeleteLead}
                      onViewConversations={onViewConversations}
                      onGetAISuggestions={onGetAISuggestions}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No leads in this stage.
                  </p>
                )}
                </div>
              </ScrollArea>
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
