import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Toggle } from '@/components/common/Toggle';
import { Badge } from '@/components/common/Badge';
import { Plus, Edit, Trash2, Eye, Clock, FileQuestion, Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Hooks
import { 
  useTests, 
  useCategories, 
  useSubjects 
} from '@/hooks/useAdminData';
import { 
  useCreateTest, 
  useUpdateTest, 
  useDeleteTest 
} from '@/hooks/useAdminMutations';

// Types
interface Test {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  duration: number;
  totalQuestions: number;
  positiveMarks: number;
  negativeMarks: number;
  type: 'Free' | 'Paid';
  testNumber: number;
  isActive: boolean;
}

export const Tests = () => {
  // 1. Fetch Data
  const { data: testsData, isLoading: isTestsLoading } = useTests();
  const { data: categoriesData = [] } = useCategories();
  const { data: subjectsData = [] } = useSubjects();

  // 2. Mutations
  const createMutation = useCreateTest();
  const updateMutation = useUpdateTest();
  const deleteMutation = useDeleteTest();

  // 3. Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    duration: 60,
    totalQuestions: 100,
    positiveMarks: 1,
    negativeMarks: 0.25,
    type: 'Free' as 'Free' | 'Paid',
    testNumber: 1,
    isActive: true,
  });

  // 4. Derived Data
  const tests = (testsData?.data?.tests as Test[]) || [];

  const filteredTests = tests.filter((test) => {
    if (selectedCategory && test.categoryId !== selectedCategory) return false;
    if (selectedType && test.type !== selectedType) return false;
    return true;
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Helpers
  const getCategoryName = (id: string) => categoriesData.find((c: any) => c.id === id)?.name || 'Unknown';

  // Handlers
  const handleOpenModal = (test?: Test) => {
    if (test) {
      setEditingTest(test);
      setFormData({
        name: test.name,
        categoryId: test.categoryId,
        description: test.description,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        positiveMarks: test.positiveMarks,
        negativeMarks: test.negativeMarks,
        type: test.type,
        testNumber: test.testNumber,
        isActive: test.isActive,
      });
    } else {
      setEditingTest(null);
      setFormData({
        name: '',
        categoryId: '',
        description: '',
        duration: 60,
        totalQuestions: 100,
        positiveMarks: 1,
        negativeMarks: 0.25,
        type: 'Free',
        testNumber: tests.length + 1,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.categoryId) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingTest) {
        await updateMutation.mutateAsync({ 
          id: editingTest.id, 
          data: formData 
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
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
    { key: 'name', label: 'Test Name', sortable: true },
    { 
      key: 'category', 
      label: 'Category',
      render: (item: Test) => getCategoryName(item.categoryId)
    },
    { 
      key: 'duration', 
      label: 'Duration',
      render: (item: Test) => (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{item.duration} min</span>
        </div>
      )
    },
    { 
      key: 'totalQuestions', 
      label: 'Questions',
      render: (item: Test) => (
        <div className="flex items-center gap-1">
          <FileQuestion className="w-4 h-4 text-muted-foreground" />
          <span>{item.totalQuestions}</span>
        </div>
      )
    },
    { 
      key: 'marking', 
      label: 'Marking',
      render: (item: Test) => (
        <span className="text-sm">
          +{item.positiveMarks}, -{item.negativeMarks}
        </span>
      )
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (item: Test) => (
        <Badge variant={item.type === 'Free' ? 'success' : 'primary'}>
          {item.type}
        </Badge>
      )
    },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (item: Test) => (
        <Toggle
          checked={item.isActive}
          onChange={() => handleToggleActive(item.id, item.isActive)}
        />
      )
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (item: Test) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenModal(item)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(item.id)}
            disabled={deleteMutation.isPending}
            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
          >
             {deleteMutation.isPending && editingTest?.id === item.id ? (
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
      title="Manage Tests" 
      breadcrumbs={[{ label: 'Tests' }]}
    >
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field w-48"
          >
            <option value="">All Categories</option>
            {categoriesData?.data?.category?.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-field w-32"
          >
            <option value="">All Types</option>
            <option value="Free">Free</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Test
        </button>
      </div>

      {/* Tests Table */}
      {isTestsLoading ? (
         <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
         </div>
      ) : (
        <DataTable
            columns={columns}
            data={filteredTests}
            searchPlaceholder="Search tests..."
            emptyMessage="No tests found"
        />
      )}

      {/* Add/Edit Test Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTest ? 'Edit Test' : 'Create New Test'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Test Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Enter test name"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Category <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="input-field"
              disabled={isSubmitting}
            >
              <option value="">Select Category</option>
              {categoriesData?.data?.category?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {formData.categoryId && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Question Distribution for {getCategoryName(formData.categoryId)}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {subjectsData.slice(0, 4).map((subject: any) => (
                  <div key={subject.id} className="flex items-center justify-between bg-card p-3 rounded-lg">
                    <span className="text-sm">{subject.name}</span>
                    <span className="text-sm font-medium text-primary">25 questions</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[80px] resize-none"
              placeholder="Enter test description"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Duration (min)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="input-field"
                min={1}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Questions</label>
              <input
                type="number"
                value={formData.totalQuestions}
                onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
                className="input-field"
                min={1}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Positive Marks</label>
              <input
                type="number"
                step="0.25"
                value={formData.positiveMarks}
                onChange={(e) => setFormData({ ...formData, positiveMarks: parseFloat(e.target.value) })}
                className="input-field"
                min={0}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Negative Marks</label>
              <input
                type="number"
                step="0.25"
                value={formData.negativeMarks}
                onChange={(e) => setFormData({ ...formData, negativeMarks: parseFloat(e.target.value) })}
                className="input-field"
                min={0}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Test Type</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={formData.type === 'Free'}
                    onChange={() => setFormData({ ...formData, type: 'Free' })}
                    className="w-4 h-4 text-primary"
                    disabled={isSubmitting}
                  />
                  <span>Free</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={formData.type === 'Paid'}
                    onChange={() => setFormData({ ...formData, type: 'Paid' })}
                    className="w-4 h-4 text-primary"
                    disabled={isSubmitting}
                  />
                  <span>Paid</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Test Number</label>
              <input
                type="number"
                value={formData.testNumber}
                onChange={(e) => setFormData({ ...formData, testNumber: parseInt(e.target.value) })}
                className="input-field"
                min={1}
                disabled={isSubmitting}
              />
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
                onClick={() => setIsModalOpen(false)} 
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
              {editingTest ? 'Update' : 'Create'} Test
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Tests;