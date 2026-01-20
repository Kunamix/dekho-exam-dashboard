import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Modal } from '@/components/common/Modal';
import { Toggle } from '@/components/common/Toggle';
import { Badge } from '@/components/common/Badge';
import { Plus, Edit, Trash2, Check, Crown, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Hooks
import { 
  useSubscriptionPlans, 
  useCategories 
} from '@/hooks/useAdminData';
import { 
  useCreatePlan, 
  useUpdatePlan, 
  useDeletePlan 
} from '@/hooks/useAdminMutations';

// Types
interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  type: 'Category' | 'All';
  categoryId: string | null;
  features: string[];
  isActive: boolean;
}

export const Subscriptions = () => {
  // 1. Fetch Data
  const { data: plansData, isLoading: isPlansLoading } = useSubscriptionPlans();
  const { data: categoriesData = [] } = useCategories();

  // 2. Mutations
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const deleteMutation = useDeletePlan();

  // 3. Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState<'category' | 'all'>('category');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 499,
    durationDays: 180,
    type: 'Category' as 'Category' | 'All',
    categoryId: '',
    features: [''],
    isActive: true,
  });

  // 4. Derived Data
  const plans = (plansData as Plan[]) || [];
  
  const filteredPlans = plans.filter((plan) => 
    activeTab === 'category' ? plan.type === 'Category' : plan.type === 'All'
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Helpers
  const getCategoryName = (id: string | null) => {
    if (!id) return 'All Categories';
    return categoriesData.find((c: any) => c.id === id)?.name || 'Unknown';
  };

  const formatDuration = (days: number) => {
    if (days >= 365) return `${Math.floor(days / 365)} Year${days >= 730 ? 's' : ''}`;
    if (days >= 30) return `${Math.floor(days / 30)} Month${days >= 60 ? 's' : ''}`;
    return `${days} Days`;
  };

  // Handlers
  const handleOpenModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        durationDays: plan.durationDays,
        type: plan.type,
        categoryId: plan.categoryId || '',
        features: plan.features.length > 0 ? plan.features : [''],
        isActive: plan.isActive,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        price: 499,
        durationDays: 180,
        type: 'Category',
        categoryId: '',
        features: [''],
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Plan name is required');
      return;
    }

    if (formData.type === 'Category' && !formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      durationDays: formData.durationDays,
      type: formData.type,
      categoryId: formData.type === 'Category' ? formData.categoryId : null,
      features: formData.features.filter((f) => f.trim()),
      isActive: formData.isActive,
    };

    try {
      if (editingPlan) {
        await updateMutation.mutateAsync({ 
          id: editingPlan.id, 
          data: payload 
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({ 
      id, 
      data: { isActive: !currentStatus } 
    });
  };

  // Feature Array Handlers
  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <DashboardLayout 
      title="Subscription Plans" 
      breadcrumbs={[{ label: 'Subscriptions' }]}
    >
      {/* Tabs & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex bg-muted rounded-lg p-1 self-start">
          <button
            onClick={() => setActiveTab('category')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'category' 
                ? 'bg-card shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Category-Specific Plans
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all' 
                ? 'bg-card shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Categories Plans
          </button>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Plan
        </button>
      </div>

      {/* Plans Grid */}
      {isPlansLoading ? (
         <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div 
              key={plan.id} 
              className={`dashboard-card p-6 relative overflow-hidden ${
                plan.type === 'All' ? 'border-2 border-primary/30' : ''
              }`}
            >
              {plan.type === 'All' && (
                <div className="absolute top-4 right-4">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="pr-8">
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <Badge variant={plan.type === 'All' ? 'primary' : 'info'} >
                    {plan.type === 'All' ? 'All Categories' : getCategoryName(plan.categoryId)}
                  </Badge>
                </div>
                <Toggle
                  checked={plan.isActive}
                  onChange={() => handleToggleActive(plan.id, plan.isActive)}
                />
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">₹{plan.price}</span>
                  <span className="text-muted-foreground">/ {formatDuration(plan.durationDays)}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                {plan.description}
              </p>

              <ul className="space-y-2 mb-6 min-h-[100px]">
                {plan.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{feature}</span>
                  </li>
                ))}
                {plan.features.length > 4 && (
                  <li className="text-xs text-muted-foreground pl-6">
                    + {plan.features.length - 4} more features
                  </li>
                )}
              </ul>

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <button 
                  onClick={() => handleOpenModal(plan)}
                  className="flex-1 btn-outline text-sm py-2"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(plan.id)}
                  disabled={deleteMutation.isPending}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending && editingPlan?.id === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                      <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isPlansLoading && filteredPlans.length === 0 && (
        <div className="text-center py-16">
          <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No plans found</h3>
          <p className="text-muted-foreground mb-6">
            Create your first {activeTab === 'category' ? 'category-specific' : 'all categories'} plan
          </p>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            Create Plan
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Plan' : 'Create New Plan'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Plan Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Enter plan name"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[80px] resize-none"
              placeholder="Enter plan description"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Price (₹) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                className="input-field"
                min={0}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (Days) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                className="input-field"
                min={1}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Plan Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="planType"
                  checked={formData.type === 'Category'}
                  onChange={() => setFormData({ ...formData, type: 'Category' })}
                  className="w-4 h-4 text-primary"
                  disabled={isSubmitting}
                />
                <span>Category-Specific</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="planType"
                  checked={formData.type === 'All'}
                  onChange={() => setFormData({ ...formData, type: 'All', categoryId: '' })}
                  className="w-4 h-4 text-primary"
                  disabled={isSubmitting}
                />
                <span>All Categories</span>
              </label>
            </div>
          </div>

          {formData.type === 'Category' && (
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
                {categoriesData.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Features</label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="input-field flex-1"
                    placeholder="Enter feature"
                    disabled={isSubmitting}
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                      disabled={isSubmitting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFeature}
              className="btn-ghost text-sm mt-2"
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Feature
            </button>
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
              {editingPlan ? 'Update' : 'Create'} Plan
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Subscriptions;