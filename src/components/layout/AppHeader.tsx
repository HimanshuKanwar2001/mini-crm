import { Briefcase, LayoutDashboard, ListChecks, History } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const AppHeader = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary-foreground">
          <Briefcase className="h-7 w-7 text-accent" />
          <span className="bg-gradient-to-r from-accent to-primary text-transparent bg-clip-text">
            LeadPilot AI
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" asChild size="sm">
            <Link href="/" className="flex items-center gap-2 text-sm">
              <ListChecks className="h-5 w-5" />
              Leads
            </Link>
          </Button>
          <Button variant="ghost" asChild size="sm">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm">
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild size="sm">
            <Link href="/activity-log" className="flex items-center gap-2 text-sm">
              <History className="h-5 w-5" />
              Activity
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
