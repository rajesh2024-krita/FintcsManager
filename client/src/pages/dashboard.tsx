import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Building, 
  Users, 
  HandCoins, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Plus,
  UserPlus,
  CheckCircle,
  FolderOutput
} from 'lucide-react';
import { authenticatedApiRequest } from '../lib/auth';

interface DashboardStats {
  totalSocieties: number;
  activeMembers: number;
  totalLoans: number;
  pendingApprovals: number;
}

interface RecentLoan {
  id: string;
  memberName: string;
  edpNo: string;
  loanType: string;
  loanAmount: string;
  loanDate: string;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await authenticatedApiRequest('GET', '/api/dashboard/stats');
      return response.json();
    },
  });

  const { data: recentLoans, isLoading: loansLoading } = useQuery<RecentLoan[]>({
    queryKey: ['/api/dashboard/recent-loans'],
    queryFn: async () => {
      const response = await authenticatedApiRequest('GET', '/api/dashboard/recent-loans');
      return response.json();
    },
  });

  const { data: pendingEdits } = useQuery({
    queryKey: ['/api/pending-edits'],
    queryFn: async () => {
      const response = await authenticatedApiRequest('GET', '/api/pending-edits');
      return response.json();
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 10000000) { // 1 crore
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) { // 1 lakh
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) { // 1 thousand
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  return (
    <MainLayout 
      title="Dashboard" 
      subtitle="Welcome back, manage your finance operations"
    >
      <div className="p-6 space-y-6" data-testid="dashboard-content">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="stats-cards">
          <Card className="financial-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Societies</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-total-societies">
                    {statsLoading ? '...' : stats?.totalSocieties || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building className="text-primary text-lg" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-accent mr-1" />
                <span className="text-accent">12%</span>
                <span className="text-muted-foreground ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="financial-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-active-members">
                    {statsLoading ? '...' : stats?.activeMembers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="text-accent text-lg" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-accent mr-1" />
                <span className="text-accent">8%</span>
                <span className="text-muted-foreground ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="financial-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Loans</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-total-loans">
                    {statsLoading ? '...' : formatCompactCurrency(stats?.totalLoans || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <HandCoins className="text-secondary text-lg" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingDown className="w-4 h-4 text-destructive mr-1" />
                <span className="text-destructive">3%</span>
                <span className="text-muted-foreground ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="financial-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-pending-approvals">
                    {statsLoading ? '...' : stats?.pendingApprovals || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Clock className="text-destructive text-lg" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-muted-foreground">Requires attention</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto bg-muted hover:bg-muted/80"
                data-testid="button-create-society"
              >
                <Plus className="text-primary text-2xl mb-2" />
                <span className="text-sm font-medium">New Society</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto bg-muted hover:bg-muted/80"
                data-testid="button-add-member"
              >
                <UserPlus className="text-accent text-2xl mb-2" />
                <span className="text-sm font-medium">Add Member</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto bg-muted hover:bg-muted/80"
                data-testid="button-process-loan"
              >
                <CheckCircle className="text-secondary text-2xl mb-2" />
                <span className="text-sm font-medium">Process Loan</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto bg-muted hover:bg-muted/80"
                data-testid="button-generate-reports"
              >
                <FolderOutput className="text-muted-foreground text-2xl mb-2" />
                <span className="text-sm font-medium">Generate Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="financial-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Loans</CardTitle>
              <Button variant="ghost" size="sm" data-testid="button-view-all-loans">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {loansLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-24" />
                          <div className="h-3 bg-muted rounded w-32" />
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="h-4 bg-muted rounded w-20" />
                        <div className="h-3 bg-muted rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentLoans && recentLoans.length > 0 ? (
                <div className="space-y-4">
                  {recentLoans.slice(0, 5).map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <HandCoins className="text-primary w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{loan.memberName}</p>
                          <p className="text-sm text-muted-foreground">
                            {loan.edpNo} • {loan.loanType}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground currency">
                          {formatCurrency(parseFloat(loan.loanAmount))}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(loan.loanDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No recent loans found</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="financial-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Approvals</CardTitle>
              <Button variant="ghost" size="sm" data-testid="button-view-all-pending">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {pendingEdits && pendingEdits.length > 0 ? (
                <div className="space-y-4">
                  {pendingEdits.slice(0, 3).map((edit: any) => (
                    <div key={edit.id} className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                          <Clock className="text-destructive w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {edit.entityType} Edit Request
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Pending Review
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="text-xs" data-testid="button-approve-request">
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="text-xs" data-testid="button-reject-request">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No pending approvals</p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </MainLayout>
  );
}
