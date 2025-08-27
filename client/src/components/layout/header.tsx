import { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
}

export function Header({ title, subtitle, onToggleSidebar }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between" data-testid="header">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-secondary"
          onClick={onToggleSidebar}
          data-testid="button-toggle-sidebar"
        >
          <Menu className="text-xl" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-foreground" data-testid="header-title">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground" data-testid="header-subtitle">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative p-2 text-secondary hover:text-foreground"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center p-0"
            data-testid="notification-badge"
          >
            3
          </Badge>
        </Button>

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Current Time:</span>
          <span 
            className="text-sm font-mono text-foreground" 
            data-testid="current-time"
          >
            {currentTime.toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })}
          </span>
        </div>
      </div>
    </header>
  );
}
