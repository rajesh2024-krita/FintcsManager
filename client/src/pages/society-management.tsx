import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MainLayout } from '../components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/use-auth';
import { authenticatedApiRequest } from '../lib/auth';
import { DataTable } from '../components/tables/data-table';
import { Plus, Edit, Building } from 'lucide-react';
import { Badge } from '../components/ui/badge';

interface Society {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  registrationNumber?: string;
  adminUserId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
}

export default function SocietyManagement() {
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    registrationNumber: '',
    adminUserId: '',
  });

  const { toast } = useToast();
  const { hasRole } = useAuth();

  const { data: societies, isLoading, refetch } = useQuery<Society[]>({
    queryKey: ['/api/societies'],
    queryFn: async () => {
      const response = await authenticatedApiRequest('GET', '/api/societies');
      return response.json();
    },
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await authenticatedApiRequest('GET', '/api/users');
      return response.json();
    },
    enabled: hasRole(['super_admin']),
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await authenticatedApiRequest('POST', '/api/societies', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Society created successfully",
      });
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<typeof formData> }) => {
      const response = await authenticatedApiRequest('PUT', `/api/societies/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Society updated successfully",
      });
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      registrationNumber: '',
      adminUserId: '',
    });
    setSelectedSociety(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSociety) {
      updateMutation.mutate({ id: selectedSociety.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (society: Society) => {
    setSelectedSociety(society);
    setFormData({
      name: society.name,
      address: society.address || '',
      phone: society.phone || '',
      email: society.email || '',
      registrationNumber: society.registrationNumber || '',
      adminUserId: society.adminUserId || '',
    });
    setIsDialogOpen(true);
  };

  const columns = [
    {
      header: 'Society Name',
      accessorKey: 'name',
      cell: (row: Society) => (
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-primary" />
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Registration Number',
      accessorKey: 'registrationNumber',
      cell: (row: Society) => (
        <span className="font-mono text-sm">{row.registrationNumber || 'N/A'}</span>
      ),
    },
    {
      header: 'Contact',
      accessorKey: 'contact',
      cell: (row: Society) => (
        <div className="space-y-1">
          {row.phone && <div className="text-sm">{row.phone}</div>}
          {row.email && <div className="text-sm text-muted-foreground">{row.email}</div>}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: (row: Society) => (
        <Badge variant={row.isActive ? 'default' : 'secondary'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row: Society) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(row)}
          data-testid={`button-edit-society-${row.id}`}
        >
          <Edit className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  if (!hasRole(['super_admin'])) {
    return (
      <MainLayout title="Society Management" subtitle="Access Denied">
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                You don't have permission to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Society Management" 
      subtitle="Manage societies and their administrators"
    >
      <div className="p-6 space-y-6">
        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Societies</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} data-testid="button-create-society">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Society
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedSociety ? 'Edit Society' : 'Create New Society'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Society Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter society name"
                        required
                        data-testid="input-society-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        placeholder="Enter registration number"
                        data-testid="input-registration-number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter society address"
                      data-testid="input-society-address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                        data-testid="input-society-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                        data-testid="input-society-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminUserId">Society Administrator</Label>
                    <Select
                      value={formData.adminUserId}
                      onValueChange={(value) => setFormData({ ...formData, adminUserId: value })}
                    >
                      <SelectTrigger data-testid="select-admin-user">
                        <SelectValue placeholder="Select administrator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {users?.filter(user => user.role === 'society_admin').map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-save-society"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? 'Saving...'
                        : selectedSociety
                        ? 'Update Society'
                        : 'Create Society'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <DataTable
              data={societies || []}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No societies found"
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
