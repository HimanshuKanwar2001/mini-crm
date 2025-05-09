'use client';

import React, { useEffect } from 'react'; // Import useEffect
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Lead, LeadStatus } from '@/types';
import { leadStatusOptions } from '@/data/mock';

const leadFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  linkedinProfileUrl: z.string().url({ message: 'Invalid URL.' }).optional().or(z.literal('')),
  company: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(), // Comma-separated string
  status: z.custom<LeadStatus>((val) => leadStatusOptions.includes(val as LeadStatus), {
    message: "Invalid status selection",
  }),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  onSubmit: (values: LeadFormValues) => void;
  defaultValues?: Partial<Lead>;
  isEditing?: boolean;
}

export function LeadForm({ onSubmit, defaultValues, isEditing = false }: LeadFormProps) {
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    // Initial default values for useForm - these are primarily set by useEffect/reset on prop changes
    defaultValues: {
      name: '',
      email: '',
      linkedinProfileUrl: '',
      company: '',
      notes: '',
      tags: '',
      status: 'New',
    },
  });

  useEffect(() => {
    // When defaultValues prop changes (e.g., opening dialog for a different lead or switching to add mode)
    // reset the form with the new default values.
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      form.reset({
        name: defaultValues.name || '',
        email: defaultValues.email || '',
        linkedinProfileUrl: defaultValues.linkedinProfileUrl || '',
        company: defaultValues.company || '',
        notes: defaultValues.notes || '',
        tags: defaultValues.tags ? defaultValues.tags.join(', ') : '', // Convert array to comma-separated string
        status: defaultValues.status || 'New',
      });
    } else {
      // For adding a new lead or if defaultValues is explicitly null/empty to clear the form
      form.reset({
        name: '',
        email: '',
        linkedinProfileUrl: '',
        company: '',
        notes: '',
        tags: '',
        status: 'New', // Default status for a new lead
      });
    }
  }, [defaultValues, form]); // form.reset is stable, but including form ensures effect runs if form instance changes (though unlikely here)

  const handleSubmit = (values: LeadFormValues) => {
    onSubmit(values);
    // Form reset is handled by the dialog closing and defaultValues changing for the next open.
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g. jane.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="linkedinProfileUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn Profile URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. https://linkedin.com/in/janedoe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Acme Corp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leadStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
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
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional, comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. important, demo-requested, tech" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any relevant notes about this lead..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto">
          {isEditing ? 'Save Changes' : 'Add Lead'}
        </Button>
      </form>
    </Form>
  );
}