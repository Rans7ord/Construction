'use client';

import React from "react"

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/app/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/data-context';
import { DashboardHeader } from '@/components/dashboard-header';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { state, createUser, updateUser, deleteUser } = useData();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'staff' });

  useEffect(() => {
    setMounted(true);
    if (user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!mounted || user?.role !== 'admin') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      updateUser(editingUser.id, formData);
      setEditingUser(null);
    } else {
      createUser(formData as any);
    }
    
    setFormData({ name: '', email: '', role: 'staff' });
    setIsOpen(false);
  };

  const handleEdit = (userData: any) => {
    setEditingUser(userData);
    setFormData({ name: userData.name, email: userData.email, role: userData.role });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'staff' });
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <DashboardHeader user={user!} />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">User Management</h2>
              <p className="text-muted-foreground mt-1">
                Create and manage team members and their roles
              </p>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2" onClick={() => {
                  setEditingUser(null);
                  setFormData({ name: '', email: '', role: 'staff' });
                }}>
                  <Plus className="w-5 h-5" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? 'Update user information and role' : 'Add a new team member to your organization'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingUser ? 'Update User' : 'Create User'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Users Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary/5 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.users.map((userData) => (
                    <tr key={userData.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                            {userData.name.charAt(0)}
                          </div>
                          <span className="font-medium text-foreground">{userData.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{userData.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary capitalize">
                          {userData.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {userData.id !== user.id && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(userData)}
                                className="gap-1"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => deleteUser(userData.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {userData.id === user.id && (
                            <span className="text-xs text-muted-foreground">Your Account</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Role Info */}
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Role Permissions</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Admin</h4>
                  <p className="text-sm text-muted-foreground">Full access to all features including user management, project creation, and deletion</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Supervisor</h4>
                  <p className="text-sm text-muted-foreground">Read-only access to projects and reports. Cannot modify or delete any data</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Staff</h4>
                  <p className="text-sm text-muted-foreground">Limited access to view project information and create expenses with restrictions</p>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </ProtectedLayout>
  );
}
