import { useState, useMemo } from "react";
import { useAuth } from "react-oidc-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { adminApi, type QuizStatus } from "@/lib/api";
import { normalizeUsersPayload, normalizeScoresPayload } from "@/lib/adminUtils";
import { Users, Award, PlusCircle, Pencil, Trash2, Upload, Download, Search, X, FileQuestion, BookOpen, ArrowLeft, Filter, Save, Send, BarChart3, Lock, Sparkles } from "lucide-react";
import { AIQuestionGenerator } from "@/components/admin/AIQuestionGenerator";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";

type ViewType = "dashboard" | "quizzes" | "questions" | "users" | "scores" | "addQuestion" | "createQuiz" | "editQuestion" | "editQuiz" | "analytics";

interface Quiz {
  quiz_id: string;
  title: string;
  topic?: string;
  duration: number;
  marks: number;
  question_ids?: string[];
  status?: QuizStatus;
}

const Admin = () => {
  const auth = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [loading, setLoading] = useState(false);

  // Auto-generate next question ID (uppercase Q format)
  const generateQuestionId = () => {
    const existingNumbers = questions
      .map(q => parseInt(q.question_id?.replace(/\D/g, '')) || 0)
      .filter(n => !isNaN(n));
    const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `Q${nextNum}`;
  };

  // Add Question form state
  const [questionForm, setQuestionForm] = useState({
    question_id: "",
    question_text: "",
    options: ["", "", "", ""],
    answer: "",
  });

  // Create Quiz form state (no quiz_id - auto-generated)
  const [quizForm, setQuizForm] = useState({
    title: "",
    question_ids: "",
    duration: "",
    total_marks: "",
    topic: "",
  });

  // Data state
  const [users, setUsers] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState<string>("all");

  // Generate unique quiz ID
  const generateQuizId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 6);
    return `quiz-${timestamp}-${randomStr}`;
  };

  /** Actions */
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const idToken = auth.user?.id_token;
      if (!idToken) throw new Error("No authentication token");

      const trimmedOptions = questionForm.options.map((o) => o.trim());
      const finalOptions = trimmedOptions.filter(Boolean);

      if (finalOptions.length < 2) {
        throw new Error("Please provide at least two options.");
      }

      if (!finalOptions.includes(questionForm.answer)) {
        throw new Error("Correct answer must be one of the options.");
      }

      const optionsObject: Record<string, string> = {};
      const keys = ['A', 'B', 'C', 'D'];
      finalOptions.forEach((option, index) => {
        if (index < keys.length) {
          optionsObject[keys[index]] = option;
        }
      });

      await adminApi.addQuestion(idToken, {
        question_id: questionForm.question_id.trim(),
        question_text: questionForm.question_text.trim(),
        options: optionsObject,
        answer: questionForm.answer,
      });

      toast({ title: "Success", description: "Question added successfully!" });
      // Reset form and auto-generate next ID
      const nextId = `Q${parseInt(questionForm.question_id.replace(/\D/g, '')) + 1}`;
      setQuestionForm({ question_id: nextId, question_text: "", options: ["", "", "", ""], answer: "" });
      handleViewQuestions();
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to add question", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent, status: QuizStatus = "PUBLISHED") => {
    e.preventDefault();
    setLoading(true);

    try {
      const idToken = auth.user?.id_token;
      if (!idToken) throw new Error("No authentication token");

      const quizId = generateQuizId();

      await adminApi.createQuiz(idToken, {
        quiz_id: quizId,
        created_at: new Date().toISOString(),
        duration: parseInt(quizForm.duration),
        marks: parseInt(quizForm.total_marks),
        question_ids: selectedQuestionIds,
        title: quizForm.title,
        topic: quizForm.topic,
        status,
      });

      toast({ 
        title: "Success", 
        description: status === "DRAFT" ? "Quiz saved as draft!" : "Quiz published successfully!" 
      });
      setQuizForm({ title: "", question_ids: "", duration: "", total_marks: "", topic: "" });
      setSelectedQuestionIds([]);
      handleViewQuizzes();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create quiz", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzesData = async () => {
    const idToken = auth.user?.id_token;
    if (!idToken) throw new Error("No authentication token");
    const data = await adminApi.listQuizzes(idToken);
    setQuizzes(data.quizzes || []);
  };

  const handleViewQuizzes = async () => {
    setLoading(true);
    setActiveView("quizzes");
    try {
      await loadQuizzesData();
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to fetch quizzes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuiz = async (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      topic: quiz.topic || "",
      duration: String(quiz.duration),
      total_marks: String(quiz.marks),
      question_ids: "",
    });
    setSelectedQuestionIds(quiz.question_ids || []);
    await loadAvailableQuestions();
    setActiveView("editQuiz");
  };

  const handleUpdateQuiz = async (e: React.FormEvent, status?: QuizStatus) => {
    e.preventDefault();
    if (!editingQuiz) return;
    
    setLoading(true);

    try {
      const idToken = auth.user?.id_token;
      if (!idToken) throw new Error("No authentication token");

      await adminApi.updateQuiz(idToken, {
        quiz_id: editingQuiz.quiz_id,
        title: quizForm.title,
        topic: quizForm.topic,
        duration: parseInt(quizForm.duration),
        marks: parseInt(quizForm.total_marks),
        question_ids: selectedQuestionIds,
        status: status || editingQuiz.status,
      });

      toast({ title: "Success", description: "Quiz updated successfully!" });
      setEditingQuiz(null);
      handleViewQuizzes();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update quiz", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    
    try {
      const idToken = auth.user?.id_token;
      if (!idToken) throw new Error("No authentication token");

      await adminApi.deleteQuiz(idToken, quizId);
      toast({ title: "Success", description: "Quiz deleted successfully!" });
      handleViewQuizzes();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete quiz", variant: "destructive" });
    }
  };

  const loadUsersData = async () => {
    const idToken = auth.user?.id_token;
    if (!idToken) throw new Error("No authentication token");
    const data = await adminApi.viewUsers(idToken);
    setUsers(normalizeUsersPayload(data));
  };

  const handleViewUsers = async () => {
    setLoading(true);
    setActiveView("users");
    try {
      await loadUsersData();
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to fetch users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadScoresData = async () => {
    const idToken = auth.user?.id_token;
    if (!idToken) throw new Error("No authentication token");
    const data = await adminApi.viewScores(idToken);
    setScores(normalizeScoresPayload(data.results || data));
    const quizzesData = await adminApi.listQuizzes(idToken);
    setQuizzes(quizzesData.quizzes || []);
  };

  const handleViewScores = async () => {
    setLoading(true);
    setActiveView("scores");
    try {
      await loadScoresData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch scores", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionsData = async () => {
    const idToken = auth.user?.id_token;
    if (!idToken) throw new Error("No authentication token");
    const data = await adminApi.viewQuestions(idToken);
    const sortedQuestions = (data.questions || []).sort((a: any, b: any) => {
      const aNum = parseInt(a.question_id.replace(/\D/g, '')) || 0;
      const bNum = parseInt(b.question_id.replace(/\D/g, '')) || 0;
      return aNum - bNum;
    });
    setQuestions(sortedQuestions);
  };

  const handleViewQuestions = async () => {
    setLoading(true);
    setActiveView("questions");
    try {
      await loadQuestionsData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch questions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async (questionData: any) => {
    try {
      const idToken = auth.user?.id_token;
      if (!idToken) throw new Error("No authentication token");

      await adminApi.updateQuestion(idToken, questionData);
      toast({ title: "Success", description: "Question updated successfully!" });
      setEditingQuestion(null);
      handleViewQuestions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update question", variant: "destructive" });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    
    try {
      const idToken = auth.user?.id_token;
      if (!idToken) throw new Error("No authentication token");

      await adminApi.deleteQuestion(idToken, questionId);
      toast({ title: "Success", description: "Question deleted successfully!" });
      handleViewQuestions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete question", variant: "destructive" });
    }
  };

  const handleBulkExport = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `questions_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({ title: "Success", description: "Questions exported successfully!" });
  };

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedQuestions = JSON.parse(text);
      
      const idToken = auth.user?.id_token;
      if (!idToken) throw new Error("No authentication token");

      for (const q of importedQuestions) {
        await adminApi.addQuestion(idToken, {
          question_id: q.question_id,
          question_text: q.question_text,
          options: q.options,
          answer: q.answer,
        });
      }

      toast({ title: "Success", description: `${importedQuestions.length} questions imported successfully!` });
      handleViewQuestions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to import questions", variant: "destructive" });
    }
  };

  const loadAvailableQuestions = async () => {
    try {
      const idToken = auth.user?.id_token;
      if (!idToken) return;

      const data = await adminApi.viewQuestions(idToken);
      setAvailableQuestions(data.questions || []);
    } catch (error: any) {
      console.error("Failed to load questions:", error);
    }
  };

  // Filtered questions based on search
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    
    const query = searchQuery.toLowerCase();
    return questions.filter(q => 
      q.question_id?.toLowerCase().includes(query) ||
      q.question_text?.toLowerCase().includes(query) ||
      Object.values(q.options || {}).some((opt: any) => 
        String(opt).toLowerCase().includes(query)
      )
    );
  }, [questions, searchQuery]);

  // Get unique quiz titles/topics for filter (only title/topic, not quiz_id)
  const uniqueQuizTitles = useMemo(() => {
    const titlesMap = new Map<string, { title: string; topic?: string }>();
    
    // From quizzes data
    quizzes.forEach(q => {
      if (q.title) {
        titlesMap.set(q.quiz_id, { title: q.title, topic: q.topic });
      }
    });
    
    // From scores data
    scores.forEach(s => {
      if (s.quiz_title && !titlesMap.has(s.quiz_id)) {
        titlesMap.set(s.quiz_id, { title: s.quiz_title, topic: s.quiz_topic });
      }
    });
    
    return Array.from(titlesMap.entries()).map(([id, data]) => ({
      quiz_id: id,
      displayName: data.topic ? `${data.title} (${data.topic})` : data.title,
      title: data.title,
      topic: data.topic
    }));
  }, [scores, quizzes]);

  // Filtered scores based on quiz title/topic filter
  const filteredScores = useMemo(() => {
    if (scoreFilter === "all") return scores;
    return scores.filter(s => s.quiz_id === scoreFilter);
  }, [scores, scoreFilter]);

  const displayName =
    auth.user?.profile?.name ||
    auth.user?.profile?.preferred_username ||
    auth.user?.profile?.nickname ||
    auth.user?.profile?.email ||
    "Admin";

  const renderBackButton = (goTo: ViewType = "dashboard") => (
    <Button variant="outline" onClick={() => setActiveView(goTo)} className="gap-2">
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );

  const getStatusBadge = (status?: QuizStatus) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 border-amber-500/30">Draft</Badge>;
      case "PUBLISHED":
        return <Badge variant="default" className="bg-primary/15 text-primary border-primary/30">Published</Badge>;
      case "CLOSED":
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Closed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="gradient-mesh" />
      <div className="noise-overlay" />
      <Header />

      <main className="flex-1 container px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-bold">
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1">Welcome back, {displayName}</p>
          </div>

          {/* Dashboard */}
          {activeView === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Quizzes", desc: "View, create, edit and delete quizzes", icon: BookOpen, onClick: handleViewQuizzes, gradient: "from-primary to-accent" },
                { title: "Questions", desc: "Manage question bank", icon: FileQuestion, onClick: handleViewQuestions, gradient: "from-accent to-primary" },
                { title: "Users", desc: "View registered users", icon: Users, onClick: handleViewUsers, gradient: "from-primary to-accent" },
                { title: "Scores", desc: "View quiz results with filters", icon: Award, onClick: handleViewScores, gradient: "from-accent to-primary" },
                { title: "Analytics", desc: "View platform insights and statistics", icon: BarChart3, onClick: async () => { setActiveView("analytics"); setLoading(true); try { await Promise.all([loadQuizzesData(), loadUsersData(), loadScoresData(), loadQuestionsData()]); } catch {} finally { setLoading(false); } }, gradient: "from-primary to-accent" },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.title}
                    className="p-6 glass-card hover-lift cursor-pointer group animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={item.onClick}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Quizzes Section */}
          {activeView === "quizzes" && (
            <Card className="p-6 md:p-8 glass-card animate-fade-in-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold">All <span className="gradient-text">Quizzes</span></h2>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => { setActiveView("createQuiz"); loadAvailableQuestions(); }}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    New Quiz
                  </Button>
                  {renderBackButton()}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading quizzes...</p>
                </div>
              ) : quizzes.length > 0 ? (
                <div className="space-y-4">
                  {quizzes.map((quiz, index) => (
                    <Card 
                      key={quiz.quiz_id} 
                      className="p-5 border border-border/50 hover:border-primary/30 transition-all animate-fade-in-up"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{quiz.title}</h3>
                            {getStatusBadge(quiz.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ⏱ {quiz.duration} mins • 🎯 {quiz.marks} marks • 📚 {quiz.topic || "General"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => handleEditQuiz(quiz)}>
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          {quiz.status === "DRAFT" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-1 text-emerald-600 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                              onClick={async () => {
                                try {
                                  const idToken = auth.user?.id_token;
                                  if (!idToken) throw new Error("No token");
                                  await adminApi.updateQuiz(idToken, { quiz_id: quiz.quiz_id, status: "PUBLISHED" });
                                  toast({ title: "Success", description: "Quiz published successfully!" });
                                  handleViewQuizzes();
                                } catch (error: any) {
                                  toast({ title: "Error", description: error.message || "Failed to publish quiz", variant: "destructive" });
                                }
                              }}
                            >
                              <Send className="h-3.5 w-3.5" />
                              Publish
                            </Button>
                          )}
                          {quiz.status !== "CLOSED" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-1"
                              onClick={async () => {
                                try {
                                  const idToken = auth.user?.id_token;
                                  if (!idToken) throw new Error("No token");
                                  await adminApi.updateQuiz(idToken, { quiz_id: quiz.quiz_id, status: "CLOSED" });
                                  toast({ title: "Success", description: "Quiz closed successfully!" });
                                  handleViewQuizzes();
                                } catch (error: any) {
                                  toast({ title: "Error", description: error.message || "Failed to close quiz", variant: "destructive" });
                                }
                              }}
                            >
                              <Lock className="h-3.5 w-3.5" />
                              Close
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-destructive hover:text-destructive gap-1"
                            onClick={() => handleDeleteQuiz(quiz.quiz_id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No quizzes found. Create your first quiz!</p>
                </div>
              )}
            </Card>
          )}

          {/* Create Quiz */}
          {activeView === "createQuiz" && (
            <Card className="p-6 md:p-8 glass-card animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create New <span className="gradient-text">Quiz</span></h2>
                {renderBackButton("quizzes")}
              </div>

              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    placeholder="e.g., AWS Basics Quiz"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={quizForm.topic}
                    onChange={(e) => setQuizForm({ ...quizForm, topic: e.target.value })}
                    placeholder="e.g., AWS Services"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Select Questions</Label>
                  <div className="border border-input rounded-xl p-4 max-h-64 overflow-y-auto space-y-3 bg-secondary/20">
                    {availableQuestions.length > 0 ? (
                      availableQuestions.map((q) => (
                        <div key={q.question_id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                          <Checkbox
                            id={q.question_id}
                            checked={selectedQuestionIds.includes(q.question_id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedQuestionIds([...selectedQuestionIds, q.question_id]);
                              } else {
                                setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== q.question_id));
                              }
                            }}
                          />
                          <Label htmlFor={q.question_id} className="font-normal cursor-pointer text-sm leading-relaxed">
                            <span className="font-semibold text-primary">{q.question_id}:</span> {q.question_text}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No questions available. Add questions first.</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Selected: {selectedQuestionIds.length} question(s)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={quizForm.duration}
                      onChange={(e) => setQuizForm({ ...quizForm, duration: e.target.value })}
                      placeholder="10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_marks">Total Marks</Label>
                    <Input
                      id="total_marks"
                      type="number"
                      value={quizForm.total_marks}
                      onChange={(e) => setQuizForm({ ...quizForm, total_marks: e.target.value })}
                      placeholder="20"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    type="button"
                    onClick={(e) => handleCreateQuiz(e, "DRAFT")} 
                    disabled={loading || selectedQuestionIds.length === 0}
                    variant="outline"
                    className="flex-1 h-11 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Saving..." : "Save as Draft"}
                  </Button>
                  <Button 
                    type="button"
                    onClick={(e) => handleCreateQuiz(e, "PUBLISHED")} 
                    disabled={loading || selectedQuestionIds.length === 0} 
                    className="flex-1 h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {loading ? "Publishing..." : "Publish Quiz"}
                  </Button>
                </div>
                {selectedQuestionIds.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">Please select at least one question</p>
                )}
              </form>
            </Card>
          )}

          {/* Edit Quiz */}
          {activeView === "editQuiz" && editingQuiz && (
            <Card className="p-6 md:p-8 glass-card animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit <span className="gradient-text">Quiz</span></h2>
                {renderBackButton("quizzes")}
              </div>

              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Quiz Title</Label>
                  <Input
                    id="edit-title"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    placeholder="e.g., AWS Basics Quiz"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-topic">Topic</Label>
                  <Input
                    id="edit-topic"
                    value={quizForm.topic}
                    onChange={(e) => setQuizForm({ ...quizForm, topic: e.target.value })}
                    placeholder="e.g., AWS Services"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Select Questions</Label>
                  <div className="border border-input rounded-xl p-4 max-h-64 overflow-y-auto space-y-3 bg-secondary/20">
                    {availableQuestions.length > 0 ? (
                      availableQuestions.map((q) => (
                        <div key={q.question_id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                          <Checkbox
                            id={`edit-${q.question_id}`}
                            checked={selectedQuestionIds.includes(q.question_id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedQuestionIds([...selectedQuestionIds, q.question_id]);
                              } else {
                                setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== q.question_id));
                              }
                            }}
                          />
                          <Label htmlFor={`edit-${q.question_id}`} className="font-normal cursor-pointer text-sm leading-relaxed">
                            <span className="font-semibold text-primary">{q.question_id}:</span> {q.question_text}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No questions available.</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Selected: {selectedQuestionIds.length} question(s)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      value={quizForm.duration}
                      onChange={(e) => setQuizForm({ ...quizForm, duration: e.target.value })}
                      placeholder="10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-total_marks">Total Marks</Label>
                    <Input
                      id="edit-total_marks"
                      type="number"
                      value={quizForm.total_marks}
                      onChange={(e) => setQuizForm({ ...quizForm, total_marks: e.target.value })}
                      placeholder="20"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    type="button"
                    onClick={(e) => handleUpdateQuiz(e, "DRAFT")} 
                    disabled={loading || selectedQuestionIds.length === 0}
                    variant="outline"
                    className="flex-1 h-11 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Saving..." : "Save as Draft"}
                  </Button>
                  <Button 
                    type="button"
                    onClick={(e) => handleUpdateQuiz(e, "PUBLISHED")} 
                    disabled={loading || selectedQuestionIds.length === 0} 
                    className="flex-1 h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {loading ? "Publishing..." : "Publish Quiz"}
                  </Button>
                </div>
                {selectedQuestionIds.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">Please select at least one question</p>
                )}
              </form>
            </Card>
          )}

          {/* Questions Section */}
          {activeView === "questions" && (
            <Card className="p-6 md:p-8 glass-card animate-fade-in-up">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">All <span className="gradient-text">Questions</span></h2>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={() => { 
                        setQuestionForm(f => ({ ...f, question_id: generateQuestionId() }));
                        setActiveView("addQuestion"); 
                      }}
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      New Question
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleBulkExport} className="gap-1">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('bulk-import')?.click()} className="gap-1">
                      <Upload className="h-4 w-4" />
                      Import
                    </Button>
                    <input id="bulk-import" type="file" accept=".json" className="hidden" onChange={handleBulkImport} />
                    {renderBackButton()}
                  </div>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search questions by ID, text, or options..."
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                
                {searchQuery && (
                  <p className="text-sm text-muted-foreground">Found {filteredQuestions.length} of {questions.length} questions</p>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading questions...</p>
                </div>
              ) : filteredQuestions.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuestions.map((question, index) => (
                    <Card 
                      key={question.question_id || index} 
                      className="p-5 border border-border/50 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {editingQuestion?.question_id === question.question_id ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Question ID</Label>
                            <Input value={editingQuestion.question_id} disabled className="bg-muted" />
                          </div>
                          <div className="space-y-2">
                            <Label>Question Text</Label>
                            <Input
                              value={editingQuestion.question_text}
                              onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {['A', 'B', 'C', 'D'].map((key) => (
                              <div key={key} className="space-y-2">
                                <Label className="font-semibold text-primary">Option {key}</Label>
                                <Input
                                  value={editingQuestion.options?.[key] || ''}
                                  onChange={(e) => setEditingQuestion({
                                    ...editingQuestion,
                                    options: { ...editingQuestion.options, [key]: e.target.value }
                                  })}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="space-y-2">
                            <Label>Correct Answer</Label>
                            <select
                              value={editingQuestion.answer}
                              onChange={(e) => setEditingQuestion({ ...editingQuestion, answer: e.target.value })}
                              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                              {Object.entries(editingQuestion.options || {}).map(([key, value]) => (
                                <option key={key} value={value as string}>{key}: {value as string}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleUpdateQuestion(editingQuestion)} size="sm">Save</Button>
                            <Button onClick={() => setEditingQuestion(null)} variant="outline" size="sm">Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-lg font-semibold">
                              <span className="text-primary">{question.question_id}:</span> {question.question_text}
                            </h3>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button size="sm" variant="ghost" onClick={() => setEditingQuestion(question)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteQuestion(question.question_id)} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {question.options && Object.entries(question.options)
                              .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                              .map(([key, value]) => (
                                <div key={key} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30 text-sm">
                                  <span className="font-bold text-primary">{key}.</span>
                                  <span>{value as string}</span>
                                </div>
                              ))
                            }
                          </div>
                          <div className="pt-2 border-t border-border/50">
                            <p className="text-sm">
                              <span className="font-medium">Correct Answer:</span>{" "}
                              <span className="text-primary font-semibold">{question.answer}</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{searchQuery ? "No questions match your search" : "No questions found"}</p>
                </div>
              )}
            </Card>
          )}

          {/* Add Question */}
          {activeView === "addQuestion" && (
            <Card className="p-6 md:p-8 glass-card animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add New <span className="gradient-text">Question</span></h2>
                {renderBackButton("questions")}
              </div>

              <form onSubmit={handleAddQuestion} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="question_id">Question ID (Auto-generated)</Label>
                  <Input
                    id="question_id"
                    value={questionForm.question_id}
                    disabled
                    className="bg-muted font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question_text">Question Text</Label>
                  <Input
                    id="question_text"
                    value={questionForm.question_text}
                    onChange={(e) => setQuestionForm((s) => ({ ...s, question_text: e.target.value }))}
                    placeholder="What does EC2 provide?"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {questionForm.options.map((opt, idx) => (
                    <div className="space-y-2" key={idx}>
                      <Label htmlFor={`option_${idx}`}>Option {idx + 1}</Label>
                      <Input
                        id={`option_${idx}`}
                        value={opt}
                        onChange={(e) => {
                          const copy = [...questionForm.options];
                          copy[idx] = e.target.value;
                          setQuestionForm((s) => ({
                            ...s,
                            options: copy,
                            answer: s.answer === opt ? e.target.value : s.answer,
                          }));
                        }}
                        placeholder={["Compute", "Storage", "Database", "Networking"][idx]}
                        required={idx < 2}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="answer">Correct Answer</Label>
                  <select
                    id="answer"
                    value={questionForm.answer}
                    onChange={(e) => setQuestionForm((s) => ({ ...s, answer: e.target.value }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    required
                  >
                    <option value="" disabled>Select the correct option</option>
                    {questionForm.options.filter((o) => o.trim().length > 0).map((o, i) => (
                      <option key={`${o}-${i}`} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg">
                  {loading ? "Adding..." : "Add Question"}
                </Button>
              </form>

              {/* AI Question Generator */}
              <div className="mt-8 pt-8 border-t border-border/50">
                <AIQuestionGenerator 
                  existingQuestionIds={questions.map(q => q.question_id)}
                  onAddQuestion={async (question) => {
                    try {
                      const idToken = auth.user?.id_token;
                      if (!idToken) throw new Error("No token");
                      await adminApi.addQuestion(idToken, question);
                      handleViewQuestions();
                    } catch (error: any) {
                      toast({ title: "Error", description: error.message || "Failed to add question", variant: "destructive" });
                    }
                  }}
                />
              </div>
            </Card>
          )}

          {/* Users Section */}
          {activeView === "users" && (
            <Card className="p-6 md:p-8 glass-card animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">All <span className="gradient-text">Users</span></h2>
                {renderBackButton()}
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              ) : users.length > 0 ? (
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, index) => (
                        <TableRow key={index} className="hover:bg-secondary/20">
                          <TableCell className="font-medium">{user.email || "N/A"}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              user.group === "Admins" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
                            }`}>
                              {user.group === "Admins" ? "Admin" : "User"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </Card>
          )}

          {/* Scores Section */}
          {activeView === "scores" && (
            <Card className="p-6 md:p-8 glass-card animate-fade-in-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold">All <span className="gradient-text">Scores</span></h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={scoreFilter} onValueChange={setScoreFilter}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Filter by Quiz Title/Topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Quizzes</SelectItem>
                        {uniqueQuizTitles.map((quiz) => (
                          <SelectItem key={quiz.quiz_id} value={quiz.quiz_id}>
                            {quiz.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {renderBackButton()}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading scores...</p>
                </div>
              ) : filteredScores.length > 0 ? (
                <div className="rounded-xl border border-border/50 overflow-hidden overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                     <TableHead>Quiz Title</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead>Answers</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredScores.map((score, index) => {
                        // Find quiz title/topic from quizzes if not in score data
                        const quizInfo = quizzes.find(q => q.quiz_id === score.quiz_id);
                        const displayTitle = score.quiz_title || quizInfo?.title || score.quiz_id || "N/A";
                        const displayTopic = score.quiz_topic || quizInfo?.topic || "-";
                        
                        return (
                          <TableRow key={index} className="hover:bg-secondary/20">
                            <TableCell className="font-medium">{displayTitle}</TableCell>
                            <TableCell className="text-muted-foreground">{displayTopic}</TableCell>
                            <TableCell>{score.user_name || score.user_email || "N/A"}</TableCell>
                            <TableCell>
                              <span className="font-semibold text-primary">{score.score !== undefined ? score.score : "N/A"}</span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{score.submitted_at || "-"}</TableCell>
                            <TableCell>
                              {score.answers ? (
                                <details className="cursor-pointer">
                                  <summary className="text-sm text-primary hover:underline">View</summary>
                                  <pre className="text-xs mt-2 p-2 bg-secondary/50 rounded overflow-auto max-w-xs">
                                    {JSON.stringify(score.answers, null, 2)}
                                  </pre>
                                </details>
                              ) : (
                                <span className="text-muted-foreground text-xs">No answers</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{scoreFilter !== "all" ? "No scores for this quiz" : "No scores found"}</p>
                </div>
              )}
            </Card>
          )}

          {/* Analytics Section */}
          {activeView === "analytics" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Platform <span className="gradient-text">Analytics</span></h2>
                {renderBackButton()}
              </div>
              <AdminAnalytics 
                users={users} 
                quizzes={quizzes} 
                scores={scores} 
                questions={questions} 
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
