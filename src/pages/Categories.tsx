import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Modal } from '@/components/common/Modal';
import { Toggle } from '@/components/common/Toggle';
import { Plus, Search, Edit, Trash2, FolderOpen, BookOpen, ClipboardList, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Import our custom hooks
import { useCategories } from '@/hooks/useAdminData';
import { 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory 
} from '@/hooks/useAdminMutations';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string | null;
  subjectsCount: number;
  testsCount: number;
  isActive: boolean;
  displayOrder: number;
}

export const Categories = () => {
  // 1. Fetch Data
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories();
  
  // 2. Initialize Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // 3. Local UI State
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 1,
    isActive: true,
  });

  // Safe access to data (default to empty array)
  const categories = categoriesData || [];

  const filteredCategories = categories.filter((cat: Category) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.description.toLowerCase().includes(search.toLowerCase())
  );

  // Check if any mutation is in progress
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        displayOrder: categories.length + 1,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        // Call Update Hook
        await updateMutation.mutateAsync({ 
          id: editingCategory.id, 
          data: formData 
        });
      } else {
        // Call Create Hook
        await createMutation.mutateAsync(formData);
      }
      // Only close modal on success (mutations throw error on fail)
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save category", error);
      // Toast is already handled in the Mutation Hook onSuccess/onError
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    // Optimistically toggle or wait for server
    updateMutation.mutate({ 
      id, 
      data: { isActive: !currentStatus } 
    });
  };

  return (
    <DashboardLayout 
      title="Manage Categories" 
      breadcrumbs={[{ label: 'Categories' }]}
    >
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 w-full sm:w-64">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
          />
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Category
        </button>
      </div>

      {/* Loading State */}
      {isCategoriesLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category: Category) => (
              <div 
                key={category.id} 
                className="dashboard-card p-6 hover:shadow-medium transition-shadow group"
              >
                {/* Image Placeholder */}
                <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg mb-4 flex items-center justify-center">
                  <FolderOpen className="w-12 h-12 text-primary/40" />
                </div>

                {/* Content */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <Toggle
                    checked={category.isActive}
                    onChange={() => handleToggleActive(category.id, category.isActive)}
                  />
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {category.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{category.subjectsCount || 0} subjects</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClipboardList className="w-4 h-4" />
                    <span>{category.testsCount || 0} tests</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <button 
                    onClick={() => handleOpenModal(category)}
                    className="flex-1 btn-outline text-sm py-2"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(category.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? (
                         <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-16">
              <FolderOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories found</h3>
              <p className="text-muted-foreground mb-6">
                {search ? 'Try adjusting your search' : 'Get started by creating your first category'}
              </p>
              {!search && (
                <button onClick={() => handleOpenModal()} className="btn-primary">
                  Create First Category
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Category Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Enter category name"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[100px] resize-none"
              placeholder="Enter category description"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload Image</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 2MB
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Display Order</label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
              className="input-field"
              min={1}
              disabled={isSubmitting}
            />
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
              {editingCategory ? 'Update' : 'Create'} Category
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Categories;