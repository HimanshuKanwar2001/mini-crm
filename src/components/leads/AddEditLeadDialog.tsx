'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LeadForm, type LeadFormValues } from './LeadForm';
import type { Lead } from '@/types';
import { PlusCircle } from 'lucide-react';

interface AddEditLeadDialogProps {
  onSave: (values: LeadFormValues, id?: string) => void;
  lead?: Lead; // Provide for editing
  triggerButton?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddEditLeadDialog({
  onSave,
  lead,
  triggerButton,
  open,
  onOpenChange,
}: AddEditLeadDialogProps) {
  const isEditing = !!lead;

  const handleSubmit = (values: LeadFormValues) => {
    onSave(values, lead?.id);
    onOpenChange?.(false); // Close dialog on save
  };
  
  const defaultTrigger = (
    <Button>
      <PlusCircle className="mr-2 h-4 w-4" /> Add New Lead
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      {!triggerButton && !open && <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this lead.' : 'Fill in the details for the new lead.'}
          </DialogDescription>
        </DialogHeader>
        <LeadForm onSubmit={handleSubmit} defaultValues={lead} isEditing={isEditing} />
      </DialogContent>
    </Dialog>
  );
}
