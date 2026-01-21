import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/common/DataTable";
import { Modal } from "@/components/common/Modal";
import { Toggle } from "@/components/common/Toggle";
import { Badge } from "@/components/common/Badge";
import {
  Plus,
  Upload,
  Edit,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

// Hooks
import {
  useQuestions,
  useSubjects,
  useTopics,
  useQuestionStats,
} from "@/hooks/useAdminData";
import {
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useBulkUploadQuestions,
} from "@/hooks/useAdminMutations";

interface Question {
  id: string;
  topicId: string;
  questionText: string; // Updated from 'text' to match API
  questionImageUrl?: string;
  options: string[]; // Frontend helper, API sends option1, option2 etc.
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: number;
  difficultyLevel: "EASY" | "MEDIUM" | "HARD"; // Updated to match Enum
  explanation: string;
  explanationImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  topic?: {
    subject?: {
      name: string;
    };
    name: string;
  };
}

export const Questions = () => {
  // 1. Local Filter & Pagination State
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  // 2. Data Hooks
  const { data: subjectsData = [] } = useSubjects();
  const { data: topicsData = [] } = useTopics(selectedSubject);
  const { data: statsData } = useQuestionStats();

  const { data: questionsResponse, isLoading: isQuestionsLoading } =
    useQuestions({
      subjectId: selectedSubject,
      topicId: selectedTopic,
      difficultyLevel: selectedDifficulty,
      search: searchQuery,
      page,
      limit: LIMIT,
    });

  const questionsList = questionsResponse?.questions || [];
  const pagination = questionsResponse?.pagination || {
    total: 0,
    totalPages: 1,
  };

  // 3. Mutation Hooks
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const deleteMutation = useDeleteQuestion();
  const bulkUploadMutation = useBulkUploadQuestions();

  // 4. UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    subjectId: "",
    topicId: "",
    questionText: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctOption: 1, // 1-based index as per backend validation
    explanation: "",
    difficultyLevel: "MEDIUM" as "EASY" | "MEDIUM" | "HARD",
    isActive: true,
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Helper Lookups
  const getSubjectName = (item: any) => item.topic?.subject?.name || "Unknown";
  const getTopicName = (item: any) => item.topic?.name || "Unknown";

  // Handlers
  const handleOpenModal = (question?: any) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        subjectId: question.topic?.subject?.id || "",
        topicId: question.topicId,
        questionText: question.questionText || question.text, // Handle potential mapping
        option1: question.option1,
        option2: question.option2,
        option3: question.option3,
        option4: question.option4,
        correctOption: question.correctOption,
        explanation: question.explanation || "",
        difficultyLevel: question.difficultyLevel || question.difficulty,
        isActive: question.isActive,
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        subjectId: selectedSubject || "",
        topicId: selectedTopic || "",
        questionText: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correctOption: 1,
        explanation: "",
        difficultyLevel: "MEDIUM",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.questionText.trim() || !formData.topicId) {
      toast.error("Please fill all required fields");
      return;
    }

    if (
      !formData.option1 ||
      !formData.option2 ||
      !formData.option3 ||
      !formData.option4
    ) {
      toast.error("All 4 options are required");
      return;
    }

    // Prepare payload matching your API expectation
    const payload = {
      topicId: formData.topicId,
      questionText: formData.questionText,
      option1: formData.option1,
      option2: formData.option2,
      option3: formData.option3,
      option4: formData.option4,
      correctOption: Number(formData.correctOption),
      difficultyLevel: formData.difficultyLevel,
      explanation: formData.explanation,
      isActive: formData.isActive,
      // questionImageUrl: ... (Add image upload logic later if needed)
    };

    try {
      if (editingQuestion) {
        await updateMutation.mutateAsync({
          id: editingQuestion.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      await bulkUploadMutation.mutateAsync(formData);
      setIsBulkModalOpen(false);
      setCsvFile(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({
      id,
      data: { isActive: !currentStatus },
    });
  };

  const difficultyVariant = {
    EASY: "success" as const,
    MEDIUM: "warning" as const,
    HARD: "danger" as const,
  };

  const columns = [
    {
      key: "questionText",
      label: "Question",
      render: (item: any) => (
        <span
          className="line-clamp-2 max-w-md text-sm"
          title={item.questionText}
        >
          {item.questionText}
        </span>
      ),
    },
    {
      key: "subject",
      label: "Subject → Topic",
      render: (item: any) => (
        <span className="text-xs text-muted-foreground">
          {getSubjectName(item)} → {getTopicName(item)}
        </span>
      ),
    },
    {
      key: "difficultyLevel",
      label: "Difficulty",
      render: (item: any) => (
        <Badge
          variant={
            difficultyVariant[
              item.difficultyLevel as keyof typeof difficultyVariant
            ] || "default"
          }
        >
          {item.difficultyLevel}
        </Badge>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (item: any) => (
        <Toggle
          checked={item.isActive}
          onChange={() => handleToggleActive(item.id, item.isActive)}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal(item)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            disabled={deleteMutation.isPending}
            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
          >
            {deleteMutation.isPending && editingQuestion?.id === item.id ? (
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
    <DashboardLayout
      title="Manage Questions"
      breadcrumbs={[{ label: "Questions" }]}
    >
      {/* Stats Overview */}
      {statsData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border p-4 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase">
              Total Questions
            </p>
            <p className="text-2xl font-bold mt-1">{statsData.total}</p>
          </div>
          <div className="bg-card border border-border p-4 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase">Active</p>
            <p className="text-2xl font-bold mt-1 text-success">
              {statsData.active}
            </p>
          </div>
          <div className="bg-card border border-border p-4 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase">
              Easy / Med / Hard
            </p>
            <p className="text-sm font-medium mt-2">
              {statsData.byDifficulty?.EASY || 0} /{" "}
              {statsData.byDifficulty?.MEDIUM || 0} /{" "}
              {statsData.byDifficulty?.HARD || 0}
            </p>
          </div>
        </div>
      )}

      {/* Top Section & Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 w-full md:w-64"
              />
            </div>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedTopic("");
              }}
              className="input-field w-40"
            >
              <option value="">All Subjects</option>
              {subjectsData?.data?.subjects?.map((sub: any) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>

            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="input-field w-40"
            >
              <option value="">All Topics</option>
              {topicsData?.data?.topics?.map((topic: any) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="input-field w-32"
            >
              <option value="">Difficulty</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="btn-outline flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk Upload</span>
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      {isQuestionsLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={questionsList}
            searchPlaceholder="Search questions..."
            searchable={false} // We handled search manually above
            emptyMessage="No questions found"
          />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline text-sm py-1 px-3 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                className="btn-outline text-sm py-1 px-3 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Question Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? "Edit Question" : "Add New Question"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Subject <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subjectId: e.target.value,
                    topicId: "",
                  })
                }
                className="input-field"
                disabled={isSubmitting}
              >
                <option value="">Select Subject</option>
                {subjectsData?.data?.subjects?.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Topic <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.topicId}
                onChange={(e) =>
                  setFormData({ ...formData, topicId: e.target.value })
                }
                className="input-field"
                disabled={!formData.subjectId || isSubmitting}
              >
                <option value="">Select Topic</option>
                {topicsData?.data?.topics
                  ?.filter((t: any) => t.subjectId === formData.subjectId)
                  ?.map((topic: any) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Question Text <span className="text-destructive">*</span>
            </label>
            <textarea
              value={formData.questionText}
              onChange={(e) =>
                setFormData({ ...formData, questionText: e.target.value })
              }
              className="input-field min-h-[80px] resize-none"
              placeholder="Enter the question"
              disabled={isSubmitting}
            />
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="relative">
                <label className="block text-sm font-medium mb-1">
                  Option {num} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={
                      formData[
                        `option${num}` as keyof typeof formData
                      ] as string
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`option${num}`]: e.target.value,
                      })
                    }
                    className="input-field pr-10"
                    placeholder={`Option ${num}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, correctOption: num })
                    }
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                      formData.correctOption === num
                        ? "text-success"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Mark as correct"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Explanation
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) =>
                setFormData({ ...formData, explanation: e.target.value })
              }
              className="input-field min-h-[80px] resize-none"
              placeholder="Enter explanation for the correct answer"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Difficulty Level
              </label>
              <select
                value={formData.difficultyLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficultyLevel: e.target.value as
                      | "EASY"
                      | "MEDIUM"
                      | "HARD",
                  })
                }
                className="input-field"
                disabled={isSubmitting}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div className="flex items-center justify-between pt-6">
              <label className="text-sm font-medium">Active Status</label>
              <Toggle
                checked={formData.isActive}
                onChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
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
              {editingQuestion ? "Update" : "Create"} Question
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Upload Questions"
        size="lg"
      >
        <form onSubmit={handleBulkUpload} className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Instructions</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Download the sample CSV template below</li>
              <li>
                Columns: topicId, questionText, option1, option2, option3,
                option4, correctOption (1-4), difficultyLevel
              </li>
              <li>Maximum 1000 rows per upload</li>
            </ul>
            <button
              type="button"
              className="btn-outline mt-3 flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Download Sample Template
            </button>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">
              {csvFile
                ? csvFile.name
                : "Drop your CSV file here or click to browse"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(false)}
              className="flex-1 btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center gap-2"
              disabled={!csvFile || bulkUploadMutation.isPending}
            >
              {bulkUploadMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Upload Questions
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Questions;
