'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ConversationType } from '@/types';
import { conversationTypeOptions } from '@/data/mock';
import { suggestConversationSummary } from '@/ai/flows/suggest-conversation-summary';
import type { SuggestConversationSummaryInput } from '@/ai/schemas/conversation-summary-schemas';
import { useToast } from '@/hooks/use-toast';
import React, { useState } from 'react';

const conversationFormSchema = z.object({
  type: z.custom<ConversationType>((val) => conversationTypeOptions.includes(val as ConversationType), {
    message: "Invalid conversation type",
  }),
  date: z.date({ required_error: 'Date is required.' }),
  summary: z.string().min(5, { message: 'Summary must be at least 5 characters.' }),
  customNotes: z.string().optional(),
  followUpReminderDate: z.date().optional(),
});

export type ConversationFormValues = z.infer<typeof conversationFormSchema>;

interface ConversationFormProps {
  onSubmit: (values: ConversationFormValues) => void;
  leadName: string;
}

export function ConversationForm({ onSubmit, leadName }: ConversationFormProps) {
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ConversationFormValues>({
    resolver: zodResolver(conversationFormSchema),
    defaultValues: {
      type: 'Email',
      date: new Date(),
      summary: '',
      customNotes: '',
    },
  });

  const handleSubmit = (values: ConversationFormValues) => {
    onSubmit(values);
    form.reset({
      type: 'Email',
      date: new Date(),
      summary: '',
      customNotes: '',
      followUpReminderDate: undefined,
    });
  };

  const handleSuggestSummary = async () => {
    const currentSummary = form.getValues('summary');
    if (!currentSummary || currentSummary.trim().length < 10) {
      setSummaryError('Please enter at least 10 characters for the AI to summarize.');
      toast({
        title: 'Input Too Short',
        description: 'Please enter at least 10 characters for the AI to summarize.',
        variant: 'destructive',
      });
      return;
    }
    setSummaryError(null);
    setIsSummaryLoading(true);
    try {
      const input: SuggestConversationSummaryInput = { rawNotes: currentSummary };
      const result = await suggestConversationSummary(input);
      form.setValue('summary', result.suggestedSummary, { shouldValidate: true });
      toast({
        title: 'Summary Suggested',
        description: 'AI has suggested a summary for your notes.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setSummaryError(`Failed to suggest summary: ${errorMessage}`);
      toast({
        title: 'AI Summary Error',
        description: `Could not suggest summary. ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsSummaryLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <h3 className="text-lg font-medium mb-4">Log Conversation for {leadName}</h3>
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select conversation type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {conversationTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Summary</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSuggestSummary}
                  disabled={isSummaryLoading}
                  className="text-accent hover:text-accent/90"
                >
                  {isSummaryLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  Suggest Summary
                </Button>
              </div>
              <FormControl>
                <Textarea placeholder="Brief summary of the conversation, or enter notes for AI to summarize..." {...field} />
              </FormControl>
              {summaryError && <p className="text-sm font-medium text-destructive">{summaryError}</p>}
              <FormMessage />
              <FormDescription>
                You can write your own summary or provide notes and click "Suggest Summary" for an AI-generated version.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes or details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="followUpReminderDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Follow-up Reminder (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a reminder date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto">Log Conversation</Button>
      </form>
    </Form>
  );
}
