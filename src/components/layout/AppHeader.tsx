import { Briefcase } from 'lucide-react';
import Link from 'next/link';

const AppHeader = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary-foreground">
          <Briefcase className="h-7 w-7 text-accent" />
          <span className="bg-gradient-to-r from-accent to-primary text-transparent bg-clip-text">
            LeadPilot AI
          </span>
        </Link>
        {/* Future navigation items can go here */}
      </div>
    </header>
  );
};

export default AppHeader;
