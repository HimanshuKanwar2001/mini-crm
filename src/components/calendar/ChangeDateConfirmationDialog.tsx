
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { CalendarFollowUpEvent } from '@/types';
import { format } from 'date-fns';

interface ChangeDateConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarFollowUpEvent | null;
  newDate: Date | null;
  onConfirm: () => void;
}

export function ChangeDateConfirmationDialog({
  open,
  onOpenChange,
  event,
  newDate,
  onConfirm,
}: ChangeDateConfirmationDialogProps) {
  if (!event || !newDate) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Date Change</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to move the follow-up reminder for{' '}
            <span className="font-semibold">{event.leadName}</span> (originally on{' '}
            {format(event.date, 'MMM dd, yyyy')}) to{' '}
            <span className="font-semibold">{format(newDate, 'MMM dd, yyyy')}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
