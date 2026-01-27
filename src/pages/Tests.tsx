import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/common/DataTable";
import { Modal } from "@/components/common/Modal";
import { Toggle } from "@/components/common/Toggle";
import { Badge } from "@/components/common/Badge";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  FileQuestion,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  useTests,
  useCreateTest,
  useUpdateTest,
  useDeleteTest,
  Test
} from "@/hooks/useTest";
import { useCategories } from "@/hooks/useCategory";
import { useSubjects } from "@/hooks/useSubject";

export const Tests = () => {
  const { 
    data: testsData, 
    isLoading: isTestsLoading,
    isError: isTestsError 
  } = useTests();
  
  const { 
    data: categoriesData,
    isError: isCategoriesError 
  } = useCategories();
  
  const { data: subjectsData } = useSubjects();

  const createMutation = useCreateTest();
  const updateMutation = useUpdateTest();
  const deleteMutation = useDeleteTest();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
    durationMinutes: 60,
    totalQuestions: 100,
    positiveMarks: 1,
    negativeMarks: 0.25,
    isPaid: true,
    testNumber: 1,
    isActive: true,
  });

  const tests = (testsData?.data?.tests as Test[]) || [];
  const categories = categoriesData?.data?.categories || [];

  const filteredTests = tests.filter((test) => {
    if (selectedCategory && test.categoryId !== selectedCategory) return false;
    
    const testType = test.isPaid ? "Paid" : "Free";
    if (selectedType && testType !== selectedType) return false;
    
    return true;
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const getCategoryName = (id: string) =>
    categories?.find((c: any) => c.id === id)?.name || "Unknown";

  const getSelectedCategory = () => {
    return categories?.find(
      (cat: any) => cat.id === formData.categoryId
    );
  };

  const calculateTotalQuestions = () => {
    const selectedCat = getSelectedCategory();
    if (!selectedCat?.categorySubjects) return 0;

    return selectedCat.categorySubjects.reduce(
      (sum: number, item: any) => sum + (item.questionsPerTest ?? 0),
      0
    );
  };

  const parseErrorMessage = (error: any): string => {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    if (typeof error === "string") return error;
    return "An unexpected error occurred. Please try again.";
  };

  const formatErrorForDisplay = (errorMsg: string): { title: string; details: string[] } => {
    if (errorMsg.includes("Insufficient unused questions")) {
      const lines = errorMsg.split("\n").filter((line) => line.trim());
      const title = "Insufficient Questions Available";
      const details = lines
        .filter((line) => line.includes("Need") || line.includes("Please"))
        .map((line) => line.trim());
      return { title, details };
    }
    if (errorMsg.includes("already exists")) {
      return { title: "Duplicate Test Number", details: [errorMsg] };
    }
    if (errorMsg.includes("required")) {
      return { title: "Missing Required Fields", details: [errorMsg] };
    }
    return { title: "Error Creating Test", details: [errorMsg] };
  };

  const handleOpenModal = (test?: Test) => {
    setErrorMessage("");
    if (test) {
      setEditingTest(test);
      setFormData({
        name: test.name,
        categoryId: test.categoryId,
        description: test.description || "",
        durationMinutes: test.durationMinutes || test.duration || 60,
        totalQuestions: test.totalQuestions || 100,
        positiveMarks: test.positiveMarks || 1,
        negativeMarks: test.negativeMarks || 0.25,
        isPaid: test.isPaid,
        testNumber: test.testNumber,
        isActive: test.isActive,
      });
    } else {
      setEditingTest(null);
      setFormData({
        name: "",
        categoryId: "",
        description: "",
        durationMinutes: 60,
        totalQuestions: 100,
        positiveMarks: 1,
        negativeMarks: 0.25,
        isPaid: true,
        testNumber: tests.length + 1,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCategoryChange = (categoryId: string) => {
    setErrorMessage("");
    const selectedCat = categories?.find(
      (cat: any) => cat.id === categoryId
    );

    if (selectedCat?.categorySubjects) {
      const total = selectedCat.categorySubjects.reduce(
        (sum: number, item: any) => sum + (item.questionsPerTest ?? 0),
        0
      );
      setFormData((prev) => ({ ...prev, categoryId, totalQuestions: total }));
    } else {
      setFormData((prev) => ({ ...prev, categoryId }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim() || !formData.categoryId) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingTest) {
        await updateMutation.mutateAsync({
          id: editingTest.id,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMsg = parseErrorMessage(error);
      setErrorMessage(errorMsg);
      const { title } = formatErrorForDisplay(errorMsg);
      toast.error(title);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) {
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

  const columns = [
    { key: "name", label: "Test Name", sortable: true },
    {
      key: "categoryId",
      label: "Category",
      render: (item: Test) => getCategoryName(item.categoryId),
    },
    {
      key: "duration",
      label: "Duration",
      render: (item: Test) => (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{item.durationMinutes || item.duration} min</span>
        </div>
      ),
    },
    {
      key: "totalQuestions",
      label: "Questions",
      render: (item: Test) => (
        <div className="flex items-center gap-1">
          <FileQuestion className="w-4 h-4 text-muted-foreground" />
          <span>{item.totalQuestions}</span>
        </div>
      ),
    },
    {
      key: "marking",
      label: "Marking",
      render: (item: Test) => (
        <span className="text-sm">
          +{item.positiveMarks}, -{item.negativeMarks}
        </span>
      ),
    },
    {
      key: "isPaid",
      label: "Type",
      render: (item: Test) => (
        <Badge variant={!item.isPaid ? "success" : "primary"}>
          {item.isPaid ? "Paid" : "Free"}
        </Badge>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (item: Test) => (
        <Toggle
          checked={item.isActive}
          onChange={() => handleToggleActive(item.id, item.isActive)}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: Test) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal(item)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Edit test"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            disabled={deleteMutation.isPending}
            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
            title="Delete test"
          >
            {deleteMutation.isPending && editingTest?.id === item.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Manage Tests" breadcrumbs={[{ label: "Tests" }]}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {isCategoriesError ? (
            <div className="p-2 bg-muted/30 rounded border border-border text-xs text-muted-foreground">
              Unable to load categories
            </div>
          ) : (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field w-48"
            >
              <option value="">All Categories</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
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
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
          disabled={isCategoriesError}
        >
          <Plus className="w-4 h-4" />
          Create New Test
        </button>
      </div>

      {isTestsLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : isTestsError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to load tests</h3>
          <p className="text-sm text-muted-foreground mb-4">
            There was a problem loading the tests. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-outline"
          >
            Refresh Page
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredTests}
          searchPlaceholder="Search tests..."
          emptyMessage="No tests found"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setErrorMessage("");
        }}
        title={editingTest ? "Edit Test" : "Create New Test"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-destructive mb-2">
                    {formatErrorForDisplay(errorMessage).title}
                  </h4>
                  <div className="space-y-1 text-sm text-destructive/90">
                    {formatErrorForDisplay(errorMessage).details.map(
                      (detail, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {detail}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Test Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="input-field"
              disabled={isSubmitting}
            >
              <option value="">Select Category</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {formData.categoryId && getSelectedCategory()?.categorySubjects && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Question Distribution for {getCategoryName(formData.categoryId)}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {getSelectedCategory()?.categorySubjects?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-card p-3 rounded-lg"
                  >
                    <span className="text-sm">{item?.subject?.name}</span>
                    <span className="text-sm font-medium text-primary">
                      {item?.questionsPerTest} questions
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Questions:</span>
                  <span className="text-sm font-bold text-primary">
                    {calculateTotalQuestions()} questions
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input-field min-h-[80px] resize-none"
              placeholder="Enter test description"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationMinutes: parseInt(e.target.value) || 0,
                  })
                }
                className="input-field"
                min={1}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Total Questions
              </label>
              <input
                type="number"
                value={formData.totalQuestions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalQuestions: parseInt(e.target.value) || 0,
                  })
                }
                className="input-field"
                min={1}
                disabled={isSubmitting}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Positive Marks
              </label>
              <input
                type="number"
                step="0.25"
                value={formData.positiveMarks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    positiveMarks: parseFloat(e.target.value) || 0,
                  })
                }
                className="input-field"
                min={0}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Negative Marks
              </label>
              <input
                type="number"
                step="0.25"
                value={formData.negativeMarks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    negativeMarks: parseFloat(e.target.value) || 0,
                  })
                }
                className="input-field"
                min={0}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Test Type
              </label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={!formData.isPaid}
                    onChange={() => setFormData({ ...formData, isPaid: false })}
                    className="w-4 h-4 text-primary"
                    disabled={isSubmitting}
                  />
                  <span>Free</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={formData.isPaid}
                    onChange={() => setFormData({ ...formData, isPaid: true })}
                    className="w-4 h-4 text-primary"
                    disabled={isSubmitting}
                  />
                  <span>Paid</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Test Number
              </label>
              <input
                type="number"
                value={formData.testNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    testNumber: parseInt(e.target.value) || 1,
                  })
                }
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
              onChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setErrorMessage("");
              }}
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
              {editingTest ? "Update" : "Create"} Test
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Tests;