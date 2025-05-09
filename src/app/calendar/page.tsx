
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Lead, Conversation, CalendarFollowUpEvent } from '@/types';
import { getLeads, updateConversationFollowUpReminder } from '@/actions/leadActions';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'; // Updated import
import { FollowUpEventItem } from '@/components/calendar/FollowUpEventItem';
import { ChangeDateConfirmationDialog } from '@/components/calendar/ChangeDateConfirmationDialog';
import { format, parseISO, startOfDay, isEqual, isSameMonth } from 'date-fns';
import { RefreshCw, CalendarDays, Grab, AlertTriangle } from 'lucide-react';
import type { DayPickerSingleProps, Modifiers } from 'react-day-picker';

// Helper function to render custom day content
const CustomDayContent: React.FC<{ 
  date: Date; 
  displayMonth: Date;
  eventsForDay: CalendarFollowUpEvent[];
  onSelectEvent: (event: CalendarFollowUpEvent) => void;
  selectedEventId?: string;
}> = ({ date, displayMonth, eventsForDay, onSelectEvent, selectedEventId }) => {
  if (!isSameMonth(date, displayMonth)) {
    return <div className="text-muted-foreground opacity-50">{format(date, 'd')}</div>;
  }
  return (
    <div className="flex flex-col h-full">
      <span className="self-start mb-1 text-base">{format(date, 'd')}</span>
      {eventsForDay.length > 0 && (
        <ScrollArea className="flex-grow h-32"> {/* Max height for event list, adjusted from h-20 */}
          <div className="space-y-1 pr-1">
            {eventsForDay.map((event) => (
              <FollowUpEventItem
                key={event.id}
                event={event}
                onSelectEvent={onSelectEvent}
                isSelected={event.id === selectedEventId}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};


export default function CalendarPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { toast } = useToast();

  const [selectedFollowUp, setSelectedFollowUp] = useState<CalendarFollowUpEvent | null>(null);
  const [targetDateForMove, setTargetDateForMove] = useState<Date | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);

  const fetchLeadsData = useCallback(async () => {
    try {
      const leadsData = await getLeads();
      setLeads(leadsData);
    } catch (error) {
      console.error("Failed to load leads for calendar:", error);
      toast({ title: "Error", description: "Failed to load lead data.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchLeadsData();
    setIsMounted(true);
  }, [fetchLeadsData]);

  const calendarEvents = useMemo<CalendarFollowUpEvent[]>(() => {
    if (!leads) return [];
    const events: CalendarFollowUpEvent[] = [];
    leads.forEach(lead => {
      lead.conversations.forEach(convo => {
        if (convo.followUpReminderDate) {
          events.push({
            id: `${lead.id}-${convo.id}`, // Unique ID for the event
            leadId: lead.id,
            leadName: lead.name,
            conversationId: convo.id,
            conversationType: convo.type,
            conversationSummary: convo.summary,
            date: startOfDay(parseISO(convo.followUpReminderDate)),
            originalData: convo,
          });
        }
      });
    });
    return events;
  }, [leads]);

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarFollowUpEvent[]> = {};
    calendarEvents.forEach(event => {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [calendarEvents]);

  const handleSelectEvent = (event: CalendarFollowUpEvent) => {
    setSelectedFollowUp(event);
    toast({ title: "Event Selected", description: `Follow-up for ${event.leadName}. Click a new date to move.` });
  };

  const handleDayClick: DayPickerSingleProps['onDayClick'] = (day, modifiers) => {
    if (modifiers.disabled) return;

    if (selectedFollowUp) {
      // If an event is selected, this click is for choosing a new date
      if (isEqual(startOfDay(day), selectedFollowUp.date)) {
        // Clicked on the same day, deselect
        setSelectedFollowUp(null);
        toast({ title: "Selection Cleared", description: "Event deselected." });
        return;
      }
      setTargetDateForMove(startOfDay(day));
      setIsConfirmationDialogOpen(true);
    } else {
      // No event selected, this click does nothing for now
      // (Could be used to add a new event in the future)
    }
  };
  
  const handleConfirmDateChange = async () => {
    if (!selectedFollowUp || !targetDateForMove) return;

    try {
      const updatedLead = await updateConversationFollowUpReminder(
        selectedFollowUp.leadId,
        selectedFollowUp.conversationId,
        targetDateForMove.toISOString()
      );

      if (updatedLead) {
        setLeads(prevLeads => prevLeads.map(l => l.id === updatedLead.id ? updatedLead : l));
        toast({ title: "Success", description: "Follow-up reminder date updated." });
      } else {
        toast({ title: "Error", description: "Failed to update reminder date.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error updating reminder date:", error);
      toast({ title: "Error", description: "An error occurred while updating.", variant: "destructive" });
    } finally {
      setSelectedFollowUp(null);
      setTargetDateForMove(null);
      setIsConfirmationDialogOpen(false);
    }
  };

  const modifiers: Modifiers = {
    hasEvent: calendarEvents.map(event => event.date),
    selectedEventOriginalDate: selectedFollowUp ? [selectedFollowUp.date] : [],
  };

  const modifiersClassNames: DayPickerSingleProps['modifiersClassNames'] = {
    hasEvent: 'day-has-event',
    selectedEventOriginalDate: 'day-selected-event-original',
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <RefreshCw className="h-10 w-10 animate-spin text-accent" />
        <p className="ml-3 text-lg text-muted-foreground">Loading Calendar...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <CalendarDays className="mr-3 h-8 w-8" /> Follow-up Calendar
        </h1>
        {selectedFollowUp && (
           <div className="p-3 bg-accent/10 rounded-md text-sm text-accent-foreground border border-accent flex items-center">
            <Grab className="h-5 w-5 mr-2 animate-pulse" />
            Selected: Reminder for <strong className="mx-1">{selectedFollowUp.leadName}</strong> on {format(selectedFollowUp.date, 'MMM dd')}. Click a new date to move.
          </div>
        )}
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0 sm:p-2 md:p-4">
          <ScrollArea className="w-full">
            <div style={{ minWidth: "1400px" }}>
              <Calendar
                mode="single" 
                selected={targetDateForMove || undefined} 
                onDayClick={handleDayClick}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="p-0 w-full [&_table]:w-full [&_table]:border-collapse"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center",
                  caption_label: "text-xl font-medium", 
                  head_row: "flex mt-4 w-full",
                  head_cell: "w-[14.2857%] text-muted-foreground rounded-md p-2 text-base font-medium", 
                  row: "flex w-full mt-2",
                  cell: "w-[14.2857%] h-40 text-sm p-0 relative [&:has([aria-selected])]:bg-accent/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 border border-border", 
                  day: "h-full w-full p-2 focus:relative focus:z-20 flex flex-col items-start justify-start hover:bg-accent/10 rounded-none", 
                  day_selected: "bg-accent/30 text-accent-foreground font-bold",
                  day_today: "bg-muted font-bold text-foreground",
                  day_outside: "text-muted-foreground opacity-50 day-outside",
                  day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
                  day_has_event: "font-semibold", 
                  day_selected_event_original: "ring-2 ring-primary ring-inset", 
                  table: "w-full border-collapse", // Explicitly ensuring table takes full width of its wide parent
                }}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                components={{
                  DayContent: (props) => (
                    <CustomDayContent
                      date={props.date}
                      displayMonth={props.displayMonth}
                      eventsForDay={eventsByDate[format(props.date, 'yyyy-MM-dd')] || []}
                      onSelectEvent={handleSelectEvent}
                      selectedEventId={selectedFollowUp?.id}
                    />
                  ),
                }}
                showOutsideDays
                fixedWeeks
              />
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <style jsx global>{`
            .day-has-event:not(.day-outside) {
              /* Visual cue for days with events, applied by modifier */
            }
            .day-selected-event-original:not(.day-outside) {
              /* Visual cue for the original date of the selected event */
            }
            .rdp-tbody .rdp-row .rdp-cell:last-child {
              border-right: 1px solid hsl(var(--border));
            }
             .rdp-tbody .rdp-row:last-child .rdp-cell {
              border-bottom: 1px solid hsl(var(--border));
            }
          `}</style>
        </CardContent>
      </Card>
      {calendarEvents.length === 0 && !isMounted && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            No upcoming follow-up reminders found.
          </CardContent>
        </Card>
      )}

      <ChangeDateConfirmationDialog
        open={isConfirmationDialogOpen}
        onOpenChange={setIsConfirmationDialogOpen}
        event={selectedFollowUp}
        newDate={targetDateForMove}
        onConfirm={handleConfirmDateChange}
      />
    </div>
  );
}

