'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lightbulb, ServerCrash } from 'lucide-react';
import type { Lead } from '@/types';

interface AISuggestionsDialogProps {
  lead: Lead | null;
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFetchSuggestions: (lead: Lead) => void;
}

export function AISuggestionsDialog({
  lead,
  suggestions,
  isLoading,
  error,
  open,
  onOpenChange,
  onFetchSuggestions,
}: AISuggestionsDialogProps) {
  
  React.useEffect(() => {
    if (open && lead && suggestions.length === 0 && !isLoading && !error) {
      onFetchSuggestions(lead);
    }
  }, [open, lead, suggestions, isLoading, error, onFetchSuggestions]);


  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-sm p-4 sm:p-6 sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-accent" />
            AI Next Step Suggestions
          </DialogTitle>
          <DialogDescription>
            Smart recommendations for engaging with {lead.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="ml-2 text-muted-foreground">Generating suggestions...</p>
            </div>
          )}
          {error && !isLoading && (
            <Alert variant="destructive">
              <ServerCrash className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && suggestions.length > 0 && (
            <ul className="space-y-2 list-disc list-inside bg-muted/30 p-4 rounded-md">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-foreground">
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
          {!isLoading && !error && suggestions.length === 0 && (
             <p className="text-center text-muted-foreground py-4">No suggestions available at the moment.</p>
          )}
        </div>
        <div className="flex justify-end">
           <Button variant="outline" onClick={() => onFetchSuggestions(lead)} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Refresh Suggestions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
