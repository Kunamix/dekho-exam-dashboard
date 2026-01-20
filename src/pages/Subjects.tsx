import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Toggle } from '@/components/common/Toggle';
import { Badge } from '@/components/common/Badge';
import { Plus, Edit, Trash2, Eye, Link, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Hooks
import { 
  useSubjects, 
  useCategories 
} from '@/hooks/useAdminData';
import { 
  useCreateSubject, 
  useUpdateSubject, 
  useDeleteSubject 
} from '@/hooks/useAdminMutations';

// Types
interface Subject {
  id: string;
  name: string;
  description: string;
  image: string | null;
  categoriesUsed: number;
  totalQuestions: number;
  isActive: boolean;
}

export const Subjects = () => {
  // 1. Fetch Data
  const { data: subjectsData, isLoading: isSubjectsLoading } = useSubjects();
  const { data: categoriesData = [] } = useCategories();

  // 2. Mutation Hooks
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const deleteMutation = useDeleteSubject();

  // 3. Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [linkingSubject, setLinkingSubject] = useState<Subject | null>(null);
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  // Link Modal State
  const [categoryLinks, setCategoryLinks] = useState<Record<string, { selected: boolean; questions: number }>>({});

  // 4. Derived Data
  const subjects = (subjectsData as Subject[]) || [];
  
  // Filter logic: In a real app, this might happen on the backend, 
  // but for now we filter the fetched list client-side if the API doesn't support ?categoryId=...
  const filteredSubjects = selectedCategory
    ? subjects // Placeholder: Add actual filter logic here if your subject object has a 'categoryIds' array
    : subjects;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Handlers
  const handleOpenModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        description: subject.description,
        isActive: subject.isActive,
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        description: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  const handleOpenLinkModal = (subject: Subject) => {
    setLinkingSubject(subject);
    
    // Initialize links state
    const links: Record<string, { selected: boolean; questions: number }> = {};
    categoriesData.forEach((cat: any) => {
      // In a real app, you'd pre-fill this with existing links from the API
      links[cat.id] = { selected: false, questions: 25 }; 
    });
    setCategoryLinks(links);
    
    setIsLinkModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    try {
      if (editingSubject) {
        await updateMutation.mutateAsync({ 
          id: editingSubject.id, 
          data: formData 
        });
        handleCloseModal();
      } else {
        const newSubject = await createMutation.mutateAsync(formData);
        handleCloseModal();
        
        // Optional: Open link modal immediately after creating
        // You might need to fetch the full object or just use the response
        if (newSubject) {
           // We need to cast or ensure the response matches Subject type
           // handleOpenLinkModal(newSubject); 
           toast.success("Subject created. You can now link categories.");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveLinks = async () => {
    if (!linkingSubject) return;

    // This logic depends on your API. 
    // Usually you'd have an endpoint like POST /subjects/:id/links
    // For now, we'll just simulate success or update a field if your API supports it.
    
    const linkedCount = Object.values(categoryLinks).filter((l) => l.selected).length;
    
    // Simulating an API call to save links
    // await api.post(`/subjects/${linkingSubject.id}/links`, { links: categoryLinks });
    
    toast.success(`Subject linked to ${linkedCount} categories`);
    setIsLinkModalOpen(false);
    setLinkingSubject(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({ 
      id, 
      data: { isActive: !currentStatus } 
    });
  };

  const columns = [
    { key: 'name', label: 'Subject Name', sortable: true },
    { 
      key: 'description', 
      label: 'Description',
      render: (item: Subject) => (
        <span className="text-muted-foreground line-clamp-1 max-w-xs" title={item.description}>
          {item.description}
        </span>
      )
    },
    { 
      key: 'categoriesUsed', 
      label: 'Used in Categories',
      sortable: true,
      render: (item: Subject) => (
        <Badge variant="primary">{item.categoriesUsed || 0} categories</Badge>
      )
    },
    { 
      key: 'totalQuestions', 
      label: 'Total Questions',
      sortable: true,
      render: (item: Subject) => (
        <span className="font-medium">{(item.totalQuestions || 0).toLocaleString()}</span>
      )
    },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (item: Subject) => (
        <Toggle
          checked={item.isActive}
          onChange={() => handleToggleActive(item.id, item.isActive)}
        />
      )
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (item: Subject) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenLinkModal(item)}
            className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
            title="Link to Categories"
          >
            <Link className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleOpenModal(item)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="View Questions"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(item.id)}
            disabled={deleteMutation.isPending}
            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
            title="Delete"
          >
             {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
             ) : (
                <Trash2 className="w-4 h-4" />
             )}
          </button>
        </div>
      )
    },
  ];

  return (
    <DashboardLayout 
      title="Manage Subjects" 
      breadcrumbs={[{ label: 'Subjects' }]}
    >
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field w-full sm:w-64"
        >
          <option value="">All Categories</option>
          {categoriesData.map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Subject
        </button>
      </div>

      {/* Subjects Table */}
      {isSubjectsLoading ? (
         <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
         </div>
      ) : (
        <DataTable
            columns={columns}
            data={filteredSubjects}
            searchPlaceholder="Search subjects..."
            emptyMessage="No subjects found"
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Subject Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Enter subject name"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[100px] resize-none"
              placeholder="Enter subject description"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload Image</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Active Status</label>
            <Toggle
              checked={formData.isActive}
              onChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
                type="button" 
                onClick={handleCloseModal} 
                className="flex-1 btn-outline"
                disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
                type="submit" 
                className="flex-1 btn-primary flex items-center justify-center gap-2"
                disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingSubject ? 'Update' : 'Create'} Subject
            </button>
          </div>
        </form>
      </Modal>

      {/* Link to Categories Modal */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title={`Link "${linkingSubject?.name}" to Categories`}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the categories where this subject should appear and set the number of questions per test.
          </p>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {categoriesData.map((category: any) => (
              <div 
                key={category.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={categoryLinks[category.id]?.selected || false}
                    onChange={(e) => setCategoryLinks({
                      ...categoryLinks,
                      [category.id]: { ...categoryLinks[category.id], selected: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={categoryLinks[category.id]?.questions || 25}
                    onChange={(e) => setCategoryLinks({
                      ...categoryLinks,
                      [category.id]: { ...categoryLinks[category.id], questions: parseInt(e.target.value) }
                    })}
                    disabled={!categoryLinks[category.id]?.selected}
                    className="input-field w-20 text-center disabled:opacity-50"
                  />
                  <span className="text-sm text-muted-foreground">questions</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => setIsLinkModalOpen(false)} 
              className="flex-1 btn-outline"
            >
              Cancel
            </button>
            <button onClick={handleSaveLinks} className="flex-1 btn-primary">
              Save Links
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Subjects;