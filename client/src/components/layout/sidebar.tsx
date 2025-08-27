import { Link, useLocation } from 'wouter';
import { useAuth } from '../../hooks/use-auth';
import { cn } from '../../lib/utils';
import { 
  Building, 
  Users, 
  UsersRound, 
  HandCoins, 
  Calculator, 
  Receipt, 
  BarChart3,
  Home,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/button';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['super_admin', 'society_admin', 'user', 'member'] },
  { name: 'Society Management', href: '/societies', icon: Building, roles: ['super_admin'] },
  { name: 'User Management', href: '/users', icon: Users, roles: ['super_admin', 'society_admin'] },
  { name: 'Member Management', href: '/members', icon: UsersRound, roles: ['super_admin', 'society_admin'] },
  { name: 'Loan Management', href: '/loans', icon: HandCoins, roles: ['super_admin', 'society_admin'] },
  { name: 'Monthly Demand', href: '/monthly-demand', icon: Calculator, roles: ['super_admin', 'society_admin'] },
  { name: 'Voucher Management', href: '/vouchers', icon: Receipt, roles: ['super_admin', 'society_admin'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['super_admin', 'society_admin', 'user'] },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout, hasRole } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    hasRole(item.roles)
  );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="w-64 sidebar-nav text-primary-foreground flex-shrink-0 hidden lg:flex flex-col" data-testid="sidebar">
      {/* Header */}
      <div className="p-6 border-b border-primary/20" data-testid="sidebar-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-primary-foreground text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Fintcs</h1>
            <p className="text-primary-foreground/70 text-sm">Finance Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2" data-testid="navigation">
        <div className="mb-4">
          <div className="px-3 py-2 text-primary-foreground/70 text-xs font-semibold uppercase tracking-wide">
            {user?.role === 'super_admin' ? 'Super Admin' : 
             user?.role === 'society_admin' ? 'Society Admin' : 
             user?.role === 'user' ? 'User' : 'Member'}
          </div>
        </div>

        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-primary-foreground/10 text-primary-foreground"
                    : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-primary/20" data-testid="user-info">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Users className="text-primary-foreground text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-primary-foreground/70 truncate">
              {user?.role === 'super_admin' ? 'Super Administrator' :
               user?.role === 'society_admin' ? 'Society Administrator' :
               user?.role === 'user' ? 'User' : 'Member'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
