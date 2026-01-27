import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Modal } from "@/components/common/Modal";
import { Toggle } from "@/components/common/Toggle";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderOpen,
  BookOpen,
  ClipboardList,
  Loader2,
  Link2,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  useCategories,
  useSubjects,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useAssignSubjectsToCategory,
  Category,
  Subject,
  SubjectAssignment
} from "@/hooks/useCategory";

export const Categories = () => {
  const { 
    data: categoriesData, 
    isLoading: isCategoriesLoading,
    isError: isCategoriesError 
  } = useCategories();
  
  const { 
    data: subjectsData,
    isError: isSubjectsError 
  } = useSubjects();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const assignSubjectsMutation = useAssignSubjectsToCategory();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [assigningCategory, setAssigningCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    displayOrder: 1,
    isActive: true,
  });
  
  const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignment[]>([]);

  const categories: Category[] = categoriesData?.data?.categories || [];
  const subjects: Subject[] = subjectsData?.data?.subjects || [];

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description?.toLowerCase().includes(search.toLowerCase())
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isAssigning = assignSubjectsMutation.isPending;

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        displayOrder: category.displayOrder || 1,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
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

  const handleOpenAssignModal = (category: Category) => {
    setAssigningCategory(category);

    const existingAssignments = category.categorySubjects?.map((cs) => ({
      subjectId: cs.subjectId,
      questionsPerTest: cs.questionsPerTest,
      displayOrder: cs.displayOrder,
    })) || [];

    setSubjectAssignments(existingAssignments);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setAssigningCategory(null);
    setSubjectAssignments([]);
  };

  const handleAddSubject = () => {
    setSubjectAssignments([
      ...subjectAssignments,
      {
        subjectId: "",
        questionsPerTest: 10,
        displayOrder: subjectAssignments.length + 1,
      },
    ]);
  };

  const handleRemoveSubject = (index: number) => {
    setSubjectAssignments(subjectAssignments.filter((_, i) => i !== index));
  };

  const handleUpdateAssignment = (
    index: number,
    field: keyof SubjectAssignment,
    value: string | number,
  ) => {
    const updated = [...subjectAssignments];
    updated[index] = { ...updated[index], [field]: value };
    setSubjectAssignments(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assigningCategory) return;

    if (subjectAssignments.length === 0) {
      toast.error("Please add at least one subject");
      return;
    }

    const hasEmptySubject = subjectAssignments.some((s) => !s.subjectId);
    if (hasEmptySubject) {
      toast.error("Please select a subject for all entries");
      return;
    }

    const hasDuplicates =
      new Set(subjectAssignments.map((s) => s.subjectId)).size !==
      subjectAssignments.length;
    if (hasDuplicates) {
      toast.error("Duplicate subjects are not allowed");
      return;
    }

    try {
      await assignSubjectsMutation.mutateAsync({
        categoryId: assigningCategory.id,
        subjects: subjectAssignments,
      });
      handleCloseAssignModal();
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { isActive: !currentStatus },
      });
    } catch (error) {
      // Error already handled by hook
    }
  };

  return (
    <DashboardLayout
      title="Manage Categories"
      breadcrumbs={[{ label: "Categories" }]}
    >
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
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Category
        </button>
      </div>

      {isCategoriesLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : isCategoriesError ? (
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to load categories</h3>
          <p className="text-sm text-muted-foreground mb-4">
            There was a problem loading the categories. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-outline"
          >
            Refresh Page
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="dashboard-card p-6 hover:shadow-medium transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <Toggle
                    checked={category.isActive}
                    onChange={() =>
                      handleToggleActive(category.id, category.isActive)
                    }
                  />
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {category.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>
                      {category?.categorySubjects?.length || 0} subjects
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClipboardList className="w-4 h-4" />
                    <span>{category._count?.tests || 0} tests</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
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
                  <button
                    onClick={() => handleOpenAssignModal(category)}
                    className="btn-primary text-sm py-2 w-full"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Assign Subjects
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && !isCategoriesError && (
            <div className="text-center py-16">
              <FolderOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No categories found
              </h3>
              <p className="text-muted-foreground mb-6">
                {search
                  ? "Try adjusting your search"
                  : "Get started by creating your first category"}
              </p>
              {!search && (
                <button
                  onClick={() => handleOpenModal()}
                  className="btn-primary"
                >
                  Create First Category
                </button>
              )}
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? "Edit Category" : "Add New Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Category Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              placeholder="Enter category name"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input-field min-h-[100px] resize-none"
              placeholder="Enter category description"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  displayOrder: parseInt(e.target.value),
                })
              }
              className="input-field"
              min={1}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Active Status</label>
            <Toggle
              checked={formData.isActive}
              onChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
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
              {editingCategory ? "Update" : "Create"} Category
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        title={`Assign Subjects to ${assigningCategory?.name || "Category"}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          {isSubjectsError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="w-10 h-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Unable to load subjects. Please try again later.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {subjectAssignments.map((assignment, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Subject
                        </label>
                        <select
                          value={assignment.subjectId}
                          onChange={(e) =>
                            handleUpdateAssignment(
                              index,
                              "subjectId",
                              e.target.value,
                            )
                          }
                          className="input-field text-sm"
                          disabled={isAssigning}
                        >
                          <option value="">Select Subject</option>
                          {subjects
                            .filter((s) => s.isActive)
                            .map((subject) => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Questions/Test
                          </label>
                          <input
                            type="number"
                            value={assignment.questionsPerTest}
                            onChange={(e) =>
                              handleUpdateAssignment(
                                index,
                                "questionsPerTest",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="input-field text-sm"
                            min={1}
                            disabled={isAssigning}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Display Order
                          </label>
                          <input
                            type="number"
                            value={assignment.displayOrder}
                            onChange={(e) =>
                              handleUpdateAssignment(
                                index,
                                "displayOrder",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="input-field text-sm"
                            min={1}
                            disabled={isAssigning}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(index)}
                      className="mt-6 p-2 rounded-lg hover:bg-destructive/10 text-destructive"
                      disabled={isAssigning}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddSubject}
                className="btn-outline w-full text-sm py-2"
                disabled={isAssigning}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </button>
            </>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseAssignModal}
              className="flex-1 btn-outline"
              disabled={isAssigning}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center gap-2"
              disabled={isAssigning || isSubjectsError}
            >
              {isAssigning && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Assignments
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Categories;