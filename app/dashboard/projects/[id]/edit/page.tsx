'use client';

import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ProtectedLayout } from '@/app/app-layout';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, MapPin, DollarSign, Calendar, User, Mail, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateForInput } from '@/lib/date-utils';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { updateProject, state } = useData();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    clientName: '',
    clientEmail: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    status: 'active' as 'active' | 'completed' | 'paused',
  });

  const project = state.projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        location: project.location,
        description: project.description,
        clientName: project.clientName,
        clientEmail: project.clientEmail,
        startDate: formatDateForInput(project.startDate),
        endDate: formatDateForInput(project.endDate),
        totalBudget: project.totalBudget.toString(),
        status: project.status,
      });
    }
  }, [project]);

  if (!project) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
          <DashboardHeader user={user!} />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Card className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
              <Button onClick={() => router.push('/dashboard')} className="mt-4">
                Return to Dashboard
              </Button>
            </Card>
          </main>
        </div>
      </ProtectedLayout>
    );
  }
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'Client email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Invalid email address';
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.totalBudget) {
      newErrors.totalBudget = 'Budget is required';
    } else if (parseFloat(formData.totalBudget) <= 0) {
      newErrors.totalBudget = 'Budget must be greater than 0';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProject(projectId, {
        ...formData,
        totalBudget: parseFloat(formData.totalBudget),
      });

      toast.success('Project updated successfully');
      router.push(`/dashboard/projects/${projectId}`);
    } catch (error) {
      toast.error('Failed to update project');
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <DashboardHeader user={user!} />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Card className="border-border/50 shadow-lg">
            <div className="p-8 md:p-12">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Edit Project</h1>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Update project details, client information, and budget
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Project Information Section */}
                <div className="border-b border-border pb-8">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Project Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">Project Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.name ? 'border-destructive' : 'border-input'
                        } bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                        placeholder="e.g., Downtown Office Complex"
                      />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">Location *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                            errors.location ? 'border-destructive' : 'border-input'
                          } bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                          placeholder="e.g., 123 Main Street, Downtown"
                        />
                      </div>
                      {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-3">Description</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-24 resize-none transition"
                        placeholder="Describe the project details, scope, and requirements..."
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-3">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
                

                {/* Client Information Section */}
                <div className="border-b border-border pb-8">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Client Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">Client Name *</label>
                      <input
                        type="text"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.clientName ? 'border-destructive' : 'border-input'
                        } bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                        placeholder="Client company name"
                      />
                      {errors.clientName && <p className="text-sm text-destructive mt-1">{errors.clientName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">Client Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          name="clientEmail"
                          value={formData.clientEmail}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                            errors.clientEmail ? 'border-destructive' : 'border-input'
                          } bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                          placeholder="client@example.com"
                        />
                      </div>
                      {errors.clientEmail && <p className="text-sm text-destructive mt-1">{errors.clientEmail}</p>}
                    </div>
                  </div>
                </div>

                {/* Project Timeline & Budget Section */}
                <div className="border-b border-border pb-8">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Timeline & Budget
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">Start Date *</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.startDate ? 'border-destructive' : 'border-input'
                        } bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                      />
                      {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">End Date *</label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.endDate ? 'border-destructive' : 'border-input'
                        } bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                      />
                      {errors.endDate && <p className="text-sm text-destructive mt-1">{errors.endDate}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">Total Budget (₵) *</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                        <input
                          type="number"
                          name="totalBudget"
                          value={formData.totalBudget}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                            errors.totalBudget ? 'border-destructive' : 'border-input'
                          } bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {errors.totalBudget && <p className="text-sm text-destructive mt-1">{errors.totalBudget}</p>}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-8">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Building2 className="w-5 h-5" />
                        Update Project
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </main>
      </div>
    </ProtectedLayout>
  );
}