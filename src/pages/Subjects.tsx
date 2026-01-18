import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Toggle } from '@/components/common/Toggle';
import { Badge } from '@/components/common/Badge';
import { Plus, Edit, Trash2, Eye, BookOpen, Link } from 'lucide-react';
import { subjects as initialSubjects, categories } from '@/data/mockData';
import { toast } from 'sonner';

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
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [linkingSubject, setLinkingSubject] = useState<Subject | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [categoryLinks, setCategoryLinks] = useState<Record<string, { selected: boolean; questions: number }>>({});

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
    const links: Record<string, { selected: boolean; questions: number }> = {};
    categories.forEach((cat) => {
      links[cat.id] = { selected: false, questions: 25 };
    });
    setCategoryLinks(links);
    setIsLinkModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    if (editingSubject) {
      setSubjects(subjects.map((sub) =>
        sub.id === editingSubject.id
          ? { ...sub, ...formData }
          : sub
      ));
      toast.success('Subject updated successfully');
    } else {
      const newSubject: Subject = {
        id: String(Date.now()),
        name: formData.name,
        description: formData.description,
        image: null,
        categoriesUsed: 0,
        totalQuestions: 0,
        isActive: formData.isActive,
      };
      setSubjects([...subjects, newSubject]);
      toast.success('Subject created successfully');
      handleOpenLinkModal(newSubject);
    }
    
    handleCloseModal();
  };

  const handleSaveLinks = () => {
    const linkedCount = Object.values(categoryLinks).filter((l) => l.selected).length;
    if (linkingSubject) {
      setSubjects(subjects.map((sub) =>
        sub.id === linkingSubject.id
          ? { ...sub, categoriesUsed: linkedCount }
          : sub
      ));
    }
    toast.success(`Subject linked to ${linkedCount} categories`);
    setIsLinkModalOpen(false);
    setLinkingSubject(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      setSubjects(subjects.filter((sub) => sub.id !== id));
      toast.success('Subject deleted successfully');
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    setSubjects(subjects.map((sub) =>
      sub.id === id ? { ...sub, isActive } : sub
    ));
    toast.success(`Subject ${isActive ? 'activated' : 'deactivated'}`);
  };

  const filteredSubjects = selectedCategory
    ? subjects
    : subjects;

  const columns = [
    { key: 'name', label: 'Subject Name', sortable: true },
    { 
      key: 'description', 
      label: 'Description',
      render: (item: Subject) => (
        <span className="text-muted-foreground line-clamp-1 max-w-xs">
          {item.description}
        </span>
      )
    },
    { 
      key: 'categoriesUsed', 
      label: 'Used in Categories',
      sortable: true,
      render: (item: Subject) => (
        <Badge variant="primary">{item.categoriesUsed} categories</Badge>
      )
    },
    { 
      key: 'totalQuestions', 
      label: 'Total Questions',
      sortable: true,
      render: (item: Subject) => (
        <span className="font-medium">{item.totalQuestions.toLocaleString()}</span>
      )
    },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (item: Subject) => (
        <Toggle
          checked={item.isActive}
          onChange={(checked) => handleToggleActive(item.id, checked)}
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
            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
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
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Subject
        </button>
      </div>

      {/* Subjects Table */}
      <DataTable
        columns={columns}
        data={filteredSubjects}
        searchPlaceholder="Search subjects..."
        emptyMessage="No subjects found"
      />

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
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[100px] resize-none"
              placeholder="Enter subject description"
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
            <button type="button" onClick={handleCloseModal} className="flex-1 btn-outline">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
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
            {categories.map((category) => (
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
