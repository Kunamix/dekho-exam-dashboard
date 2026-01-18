import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Modal } from '@/components/common/Modal';
import { Toggle } from '@/components/common/Toggle';
import { Badge } from '@/components/common/Badge';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, FileText, Video, HelpCircle } from 'lucide-react';
import { topics as initialTopics, subjects } from '@/data/mockData';
import { toast } from 'sonner';

interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  hasStudyMaterial: boolean;
  hasVideo: boolean;
  questionsCount: number;
}

export const Topics = () => {
  const [topics, setTopics] = useState<Topic[]>(initialTopics as Topic[]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    subjectId: '',
    name: '',
    description: '',
    studyContent: '',
    videoUrl: '',
    displayOrder: 1,
  });

  const toggleExpanded = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const handleOpenModal = (topic?: Topic) => {
    if (topic) {
      setEditingTopic(topic);
      setFormData({
        subjectId: topic.subjectId,
        name: topic.name,
        description: topic.description,
        studyContent: '',
        videoUrl: '',
        displayOrder: 1,
      });
    } else {
      setEditingTopic(null);
      setFormData({
        subjectId: selectedSubject || '',
        name: '',
        description: '',
        studyContent: '',
        videoUrl: '',
        displayOrder: topics.length + 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.subjectId) {
      toast.error('Please fill all required fields');
      return;
    }

    const topicData: Topic = {
      id: editingTopic?.id || String(Date.now()),
      subjectId: formData.subjectId,
      name: formData.name,
      description: formData.description,
      hasStudyMaterial: formData.studyContent.trim().length > 0,
      hasVideo: formData.videoUrl.trim().length > 0,
      questionsCount: editingTopic?.questionsCount || 0,
    };

    if (editingTopic) {
      setTopics(topics.map((t) => t.id === editingTopic.id ? topicData : t));
      toast.success('Topic updated successfully');
    } else {
      setTopics([...topics, topicData]);
      toast.success('Topic created successfully');
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this topic?')) {
      setTopics(topics.filter((t) => t.id !== id));
      toast.success('Topic deleted successfully');
    }
  };

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || 'Unknown';

  const groupedTopics = subjects.map((subject) => ({
    ...subject,
    topics: topics.filter((t) => t.subjectId === subject.id),
  })).filter((s) => !selectedSubject || s.id === selectedSubject);

  return (
    <DashboardLayout 
      title="Manage Topics & Study Material" 
      breadcrumbs={[{ label: 'Topics' }]}
    >
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="input-field w-full sm:w-64"
        >
          <option value="">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ))}
        </select>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Topic
        </button>
      </div>

      {/* Topics by Subject */}
      <div className="space-y-4">
        {groupedTopics.map((subject) => (
          <div key={subject.id} className="dashboard-card overflow-hidden">
            {/* Subject Header */}
            <button
              onClick={() => toggleExpanded(subject.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedSubjects.has(subject.id) ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
                <div className="text-left">
                  <h3 className="font-semibold">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {subject.topics.length} topics
                  </p>
                </div>
              </div>
              <Badge variant="primary">{subject.topics.length}</Badge>
            </button>

            {/* Topics List */}
            {expandedSubjects.has(subject.id) && (
              <div className="border-t border-border">
                {subject.topics.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No topics found for this subject
                  </div>
                ) : (
                  subject.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{topic.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {topic.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5">
                            <FileText className={`w-4 h-4 ${topic.hasStudyMaterial ? 'text-success' : 'text-muted-foreground'}`} />
                            <span className="text-xs">
                              {topic.hasStudyMaterial ? 'Has Study Material' : 'No Material'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Video className={`w-4 h-4 ${topic.hasVideo ? 'text-success' : 'text-muted-foreground'}`} />
                            <span className="text-xs">
                              {topic.hasVideo ? 'Has Video' : 'No Video'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs">{topic.questionsCount} questions</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(topic)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(topic.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTopic ? 'Edit Topic' : 'Add New Topic'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Subject <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
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
              Topic Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Enter topic name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[80px] resize-none"
              placeholder="Enter topic description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Study Material Content</label>
            <textarea
              value={formData.studyContent}
              onChange={(e) => setFormData({ ...formData, studyContent: e.target.value })}
              className="input-field min-h-[150px] resize-none font-mono text-sm"
              placeholder="Enter study material content (supports markdown)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Video URL</label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="input-field"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload PDF</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF files up to 10MB</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Display Order</label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
              className="input-field w-32"
              min={1}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-outline">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {editingTopic ? 'Update' : 'Create'} Topic
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Topics;
