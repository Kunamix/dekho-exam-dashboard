import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Toggle } from '@/components/common/Toggle';
import { Badge } from '@/components/common/Badge';
import { Plus, Upload, Edit, Trash2, Eye, Download, CheckCircle, XCircle } from 'lucide-react';
import { questions as initialQuestions, subjects, topics } from '@/data/mockData';
import { toast } from 'sonner';

interface Question {
  id: string;
  subjectId: string;
  topicId: string;
  text: string;
  options: string[];
  correctOption: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explanation: string;
  isActive: boolean;
  createdAt: string;
}

export const Questions = () => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions as Question[]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  
  const [formData, setFormData] = useState({
    subjectId: '',
    topicId: '',
    text: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctOption: 0,
    explanation: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    isActive: true,
  });

  const filteredTopics = selectedSubject
    ? topics.filter((t) => t.subjectId === selectedSubject)
    : topics;

  const handleOpenModal = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        subjectId: question.subjectId,
        topicId: question.topicId,
        text: question.text,
        option1: question.options[0],
        option2: question.options[1],
        option3: question.options[2],
        option4: question.options[3],
        correctOption: question.correctOption,
        explanation: question.explanation,
        difficulty: question.difficulty,
        isActive: question.isActive,
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        subjectId: '',
        topicId: '',
        text: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctOption: 0,
        explanation: '',
        difficulty: 'Medium',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.text.trim() || !formData.subjectId || !formData.topicId) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!formData.option1 || !formData.option2 || !formData.option3 || !formData.option4) {
      toast.error('All options are required');
      return;
    }

    const questionData: Question = {
      id: editingQuestion?.id || String(Date.now()),
      subjectId: formData.subjectId,
      topicId: formData.topicId,
      text: formData.text,
      options: [formData.option1, formData.option2, formData.option3, formData.option4],
      correctOption: formData.correctOption,
      difficulty: formData.difficulty,
      explanation: formData.explanation,
      isActive: formData.isActive,
      createdAt: editingQuestion?.createdAt || new Date().toISOString().split('T')[0],
    };

    if (editingQuestion) {
      setQuestions(questions.map((q) => q.id === editingQuestion.id ? questionData : q));
      toast.success('Question updated successfully');
    } else {
      setQuestions([...questions, questionData]);
      toast.success('Question created successfully');
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter((q) => q.id !== id));
      toast.success('Question deleted successfully');
    }
  };

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || 'Unknown';
  const getTopicName = (id: string) => topics.find((t) => t.id === id)?.name || 'Unknown';

  const difficultyVariant = {
    Easy: 'success' as const,
    Medium: 'warning' as const,
    Hard: 'danger' as const,
  };

  const columns = [
    { 
      key: 'text', 
      label: 'Question',
      render: (item: Question) => (
        <span className="line-clamp-2 max-w-md">{item.text}</span>
      )
    },
    { 
      key: 'subject', 
      label: 'Subject → Topic',
      render: (item: Question) => (
        <span className="text-sm">
          {getSubjectName(item.subjectId)} → {getTopicName(item.topicId)}
        </span>
      )
    },
    { 
      key: 'difficulty', 
      label: 'Difficulty',
      render: (item: Question) => (
        <Badge variant={difficultyVariant[item.difficulty]}>{item.difficulty}</Badge>
      )
    },
    { key: 'createdAt', label: 'Created On', sortable: true },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (item: Question) => (
        <Toggle
          checked={item.isActive}
          onChange={(checked) => {
            setQuestions(questions.map((q) =>
              q.id === item.id ? { ...q, isActive: checked } : q
            ));
          }}
        />
      )
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (item: Question) => (
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
            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  return (
    <DashboardLayout 
      title="Manage Questions" 
      breadcrumbs={[{ label: 'Questions' }]}
    >
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedTopic('');
            }}
            className="input-field w-48"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="input-field w-48"
            disabled={!selectedSubject}
          >
            <option value="">All Topics</option>
            {filteredTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>{topic.name}</option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsBulkModalOpen(true)} 
            className="btn-outline flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload CSV
          </button>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </div>

      {/* Questions Table */}
      <DataTable
        columns={columns}
        data={questions}
        searchPlaceholder="Search questions..."
        emptyMessage="No questions found"
      />

      {/* Add/Edit Question Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add New Question'}
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
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value, topicId: '' })}
                className="input-field"
              >
                <option value="">Select Subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Topic <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.topicId}
                onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                className="input-field"
                disabled={!formData.subjectId}
              >
                <option value="">Select Topic</option>
                {topics.filter((t) => t.subjectId === formData.subjectId).map((topic) => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Question Text <span className="text-destructive">*</span>
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="input-field min-h-[80px] resize-none"
              placeholder="Enter the question"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="relative">
                <label className="block text-sm font-medium mb-1">
                  Option {num} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData[`option${num}` as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ ...formData, [`option${num}`]: e.target.value })}
                    className="input-field pr-10"
                    placeholder={`Option ${num}`}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, correctOption: num - 1 })}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                      formData.correctOption === num - 1 
                        ? 'text-success' 
                        : 'text-muted-foreground hover:text-foreground'
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
            <label className="block text-sm font-medium mb-1">Explanation</label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="input-field min-h-[80px] resize-none"
              placeholder="Enter explanation for the correct answer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty Level</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
                className="input-field"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="flex items-center justify-between pt-6">
              <label className="text-sm font-medium">Active Status</label>
              <Toggle
                checked={formData.isActive}
                onChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-outline">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {editingQuestion ? 'Update' : 'Create'} Question
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
        <div className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Instructions</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Download the sample CSV template below</li>
              <li>Fill in the questions following the format</li>
              <li>Maximum 1000 rows per upload</li>
            </ul>
            <button className="btn-outline mt-3 flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Download Sample Template
            </button>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">Drop your CSV file here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </div>

          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={() => setIsBulkModalOpen(false)} 
              className="flex-1 btn-outline"
            >
              Cancel
            </button>
            <button className="flex-1 btn-primary" disabled>
              Upload Questions
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Questions;
