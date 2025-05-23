
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Lead, Conversation } from '@/types';
import { ConversationForm, type ConversationFormValues } from './ConversationForm';
import { ConversationList } from './ConversationList';

interface ConversationDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogConversation: (leadId: string, values: ConversationFormValues) => void;
}

export function ConversationDialog({
  lead,
  open,
  onOpenChange,
  onLogConversation,
}: ConversationDialogProps) {
  if (!lead) return null;

  const handleLogConversation = (values: ConversationFormValues) => {
    onLogConversation(lead.id, values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-sm p-4 sm:p-6 sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Conversations</DialogTitle>
          <DialogDescription>
            Log new communications and view past interactions with {lead.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 space-y-6"> {/* Keep pr-2 for scrollbar visibility if content overflows */}
          <ConversationList conversations={lead.conversations} leadName={lead.name} />
          <Separator />
          <ConversationForm onSubmit={handleLogConversation} leadName={lead.name} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
