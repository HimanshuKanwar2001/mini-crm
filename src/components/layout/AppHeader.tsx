import { Briefcase, LayoutDashboard, ListChecks, History, BellRing } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const AppHeader = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
          <Briefcase className="h-7 w-7 text-accent flex-shrink-0" />
          <span className="hidden sm:inline bg-gradient-to-r from-accent to-primary text-transparent bg-clip-text">
            LeadPilot AI
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
          <Button variant="ghost" asChild size="sm" className="px-2 py-2 sm:px-3">
            <Link href="/" className="flex items-center gap-0 sm:gap-2 text-sm">
              <ListChecks className="h-5 w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Leads</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild size="sm" className="px-2 py-2 sm:px-3">
            <Link href="/dashboard" className="flex items-center gap-0 sm:gap-2 text-sm">
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild size="sm" className="px-2 py-2 sm:px-3">
            <Link href="/activity-log" className="flex items-center gap-0 sm:gap-2 text-sm">
              <History className="h-5 w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Activity</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild size="sm" className="px-2 py-2 sm:px-3">
            <Link href="/follow-ups" className="flex items-center gap-0 sm:gap-2 text-sm">
              <BellRing className="h-5 w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Follow-ups</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
