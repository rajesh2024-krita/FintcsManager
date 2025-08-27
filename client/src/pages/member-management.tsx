import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MainLayout } from '../components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/use-auth';
import { authenticatedApiRequest } from '../lib/auth';
import { DataTable } from '../components/tables/data-table';
import { MemberForm } from '../components/forms/member-form';
import { Plus, Edit, UserCheck, Upload, Camera } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

interface Member {
  id: string;
  memNo: string;
  name: string;
  fatherHusbandName?: string;
  mobile?: string;
  email?: string;
  designation?: string;
  status: 'active' | 'inactive';
  photoUrl?: string;
  signatureUrl?: string;
  openingBalanceShare: string;
  dateOfJoiningSociety?: string;
  societyId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MemberManagement() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [fileUploadType, setFileUploadType] = useState<'photo' | 'signature'>('photo');

  const { toast } = useToast();
  const { hasRole } = useAuth();

  const { data: members, isLoading, refetch } = useQuery<Member[]>({
    queryKey: ['/api/members'],
    queryFn: async () => {
      const response = await authenticatedApiRequest('GET', '/api/members');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await authenticatedApiRequest('POST', '/api/members', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member created successfully",
      });
      refetch();
      setIsDialogOpen(false);
      setSelectedMember(null);
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
    mutationFn: async (data: { id: string; updates: any }) => {
      const response = await authenticatedApiRequest('PUT', `/api/members/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member updated successfully",
      });
      refetch();
      setIsDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fileUploadMutation = useMutation({
    mutationFn: async (data: { id: string; file: File; type: 'photo' | 'signature' }) => {
      const formData = new FormData();
      formData.append(data.type, data.file);
      
      const response = await fetch(`/api/members/${data.id}/${data.type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fintcs_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${data.type}`);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: `${variables.type} uploaded successfully`,
      });
      refetch();
      setIsFileDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const handleFileUpload = (memberId: string, type: 'photo' | 'signature') => {
    setSelectedMember(members?.find(m => m.id === memberId) || null);
    setFileUploadType(type);
    setIsFileDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedMember) {
      fileUploadMutation.mutate({
        id: selectedMember.id,
        file,
        type: fileUploadType,
      });
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(num);
  };

  const columns = [
    {
      header: 'Member',
      accessorKey: 'member',
      cell: (row: Member) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={row.photoUrl} alt={row.name} />
            <AvatarFallback>
              <UserCheck className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-muted-foreground font-mono">{row.memNo}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessorKey: 'contact',
      cell: (row: Member) => (
        <div className="space-y-1">
          {row.mobile && <div className="text-sm">{row.mobile}</div>}
          {row.email && <div className="text-sm text-muted-foreground">{row.email}</div>}
        </div>
      ),
    },
    {
      header: 'Designation',
      accessorKey: 'designation',
      cell: (row: Member) => (
        <span className="text-sm">{row.designation || 'N/A'}</span>
      ),
    },
    {
      header: 'Opening Balance',
      accessorKey: 'openingBalanceShare',
      cell: (row: Member) => (
        <span className="font-mono text-sm">
          {formatCurrency(row.openingBalanceShare)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: Member) => (
        <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row: Member) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            data-testid={`button-edit-member-${row.id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFileUpload(row.id, 'photo')}
            data-testid={`button-upload-photo-${row.id}`}
          >
            <Camera className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFileUpload(row.id, 'signature')}
            data-testid={`button-upload-signature-${row.id}`}
          >
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (!hasRole(['super_admin', 'society_admin'])) {
    return (
      <MainLayout title="Member Management" subtitle="Access Denied">
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
      title="Member Management" 
      subtitle="Manage society members and their details"
    >
      <div className="p-6 space-y-6">
        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Members</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setSelectedMember(null)} 
                  data-testid="button-create-member"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedMember ? 'Edit Member' : 'Add New Member'}
                  </DialogTitle>
                </DialogHeader>
                <MemberForm
                  member={selectedMember}
                  onSubmit={(data: any) => {
                    if (selectedMember) {
                      updateMutation.mutate({ id: selectedMember.id, updates: data });
                    } else {
                      createMutation.mutate(data);
                    }
                  }}
                  onCancel={() => setIsDialogOpen(false)}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <DataTable
              data={members || []}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No members found"
            />
          </CardContent>
        </Card>

        {/* File Upload Dialog */}
        <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Upload {fileUploadType === 'photo' ? 'Photo' : 'Signature'} for {selectedMember?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  {fileUploadType === 'photo' ? (
                    <Camera className="w-12 h-12 text-muted-foreground" />
                  ) : (
                    <Upload className="w-12 h-12 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    Click to select {fileUploadType}
                  </span>
                </label>
              </div>
              {fileUploadMutation.isPending && (
                <div className="text-center text-sm text-muted-foreground">
                  Uploading...
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
