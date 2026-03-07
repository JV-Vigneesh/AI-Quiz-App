import { useState, useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { userApi } from "@/lib/api";
import { BookOpen, Award, ArrowLeft, CheckCircle2, XCircle, Circle, User as UserIcon, BarChart3, Trophy } from "lucide-react";
import { UserProfile } from "@/components/user/UserProfile";
import { UserAchievements } from "@/components/user/UserAchievements";
import { UserAnalytics } from "@/components/user/UserAnalytics";

interface Quiz {
  quiz_id: string;
  title: string;
  topic?: string;
  duration: number;
  marks: number;
}

interface Question {
  question_id: string;
  question_text: string;
  options: Record<string, string>;
}

const User = () => {
  const auth = useAuth();
  const [activeView, setActiveView] = useState<"dashboard" | "quizList" | "takeQuiz" | "review" | "result" | "viewScores" | "profile" | "achievements" | "analytics">("dashboard");
  const [loading, setLoading] = useState(false);
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<any[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const hasSubmittedRef = useRef(false);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const idToken = auth.user?.id_token;
      if (!idToken) throw new Error("No authentication token");

      const data = await userApi.listQuizzes(idToken);
      setQuizzes(data.quizzes || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load quizzes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quiz: Quiz) => {
    setLoading(true);
    setSelectedQuiz(quiz);
    setAnswers({});
    setQuizResult(null);
    setTimeLeft(quiz.duration * 60); // Convert minutes to seconds
    hasSubmittedRef.current = false;

    try {
      const idToken = auth.user?.id_token;
      if (!idToken) throw new Error("No authentication token");

      const data = await userApi.getQuizQuestions(idToken, quiz.quiz_id);
      setQuestions(data.questions || []);
      setActiveView("takeQuiz");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load quiz questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!selectedQuiz || hasSubmittedRef.current) return;

    hasSubmittedRef.current = true;
    setLoading(true);
    try {
      const idToken = auth.user?.id_token;
      if (!idToken) throw new Error("No authentication token");

      // Convert numeric key (0/1/2/3) to actual option text before sending
      const formattedAnswers: Record<string, string> = {};

      questions.forEach((q) => {
        const selectedKey = answers[q.question_id]; // "0" | "1" | "2" | "3"
        formattedAnswers[q.question_id] = selectedKey ? q.options[selectedKey] : "";
      });

      // Send quiz title and topic along with the submission
      const result = await userApi.submitQuiz(
        idToken, 
        selectedQuiz.quiz_id, 
        formattedAnswers,
        selectedQuiz.title,
        selectedQuiz.topic
      );

      // Store correct answers for review
      const correctAns: Record<string, string> = {};
      if (result.correct_answers) {
        Object.keys(result.correct_answers).forEach((qId) => {
          correctAns[qId] = result.correct_answers[qId];
        });
      }
      setCorrectAnswers(correctAns);
      setQuizResult(result);
      setActiveView("review");

      // Auto-transition to results page after 8 seconds
      setTimeout(() => {
        setActiveView("result");
      }, 8000);
    } catch (error: any) {
      hasSubmittedRef.current = false;
      toast({
        title: "Error",
        description: error.message || "Failed to submit quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadScoresData = async () => {
    const idToken = auth.user?.id_token;
    if (!idToken) throw new Error("No authentication token");

    const data = await userApi.viewScore(idToken);
    
    const quizzesData = await userApi.listQuizzes(idToken);
    const quizMap = new Map((quizzesData.quizzes || []).map((q: Quiz) => [q.quiz_id, q.title]));
    
    const scoresWithTitles = (data.scores || data.results || data.items || []).map((score: any) => ({
      ...score,
      quiz_title: score.quiz_title || quizMap.get(score.quiz_id) || score.quiz_id,
      submitted_at: score.submitted_at || score.submittedAt || score.submitted_date || null,
    }));
    
    setScores(scoresWithTitles);
  };

  const loadScores = async () => {
    setLoading(true);
    setActiveView("viewScores");

    try {
      await loadScoresData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load scores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (activeView === "quizList") {
      loadQuizzes();
    }
  }, [activeView]);

  // Timer countdown effect
  useEffect(() => {
    if (activeView === "takeQuiz" && timeLeft > 0 && !hasSubmittedRef.current) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activeView]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (activeView === "takeQuiz" && timeLeft === 0 && !hasSubmittedRef.current && selectedQuiz && questions.length > 0) {
      submitQuiz();
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const allQuestionsAnswered = questions.length > 0 && questions.every(q => answers[q.question_id]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="gradient-mesh" />
      <div className="noise-overlay" />
      <Header />
      
      <main className="flex-1 container px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-bold">
              User <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {auth.user?.profile.name || auth.user?.profile.email}
            </p>
          </div>

          {activeView === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card 
                className="p-6 glass-card hover-lift cursor-pointer group animate-fade-in-up" 
                onClick={() => setActiveView("quizList")}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Take Quiz</h3>
                    <p className="text-muted-foreground">Browse and start quizzes</p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 glass-card hover-lift cursor-pointer group animate-fade-in-up" 
                style={{ animationDelay: "100ms" }}
                onClick={loadScores}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">My Scores</h3>
                    <p className="text-muted-foreground">View your quiz results</p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 glass-card hover-lift cursor-pointer group animate-fade-in-up" 
                style={{ animationDelay: "200ms" }}
                onClick={() => { loadScoresData().catch(() => {}); setActiveView("achievements"); }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Achievements</h3>
                    <p className="text-muted-foreground">View your progress & badges</p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 glass-card hover-lift cursor-pointer group animate-fade-in-up" 
                style={{ animationDelay: "300ms" }}
                onClick={() => { setActiveView("analytics"); loadScoresData().catch(() => {}); }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Analytics</h3>
                    <p className="text-muted-foreground">Track your performance</p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 glass-card hover-lift cursor-pointer group animate-fade-in-up" 
                style={{ animationDelay: "400ms" }}
                onClick={() => setActiveView("profile")}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <UserIcon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">My Profile</h3>
                    <p className="text-muted-foreground">Account settings</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeView === "quizList" && (
            <Card className="p-8 glass-card animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Available <span className="gradient-text">Quizzes</span></h2>
                <Button variant="outline" onClick={() => setActiveView("dashboard")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading quizzes...</p>
                </div>
              ) : quizzes.length > 0 ? (
                <div className="grid gap-4">
                  {quizzes.map((quiz, index) => (
                    <Card 
                      key={quiz.quiz_id} 
                      className="p-6 border border-border/50 hover:border-primary/30 hover:bg-secondary/20 transition-all animate-fade-in-up"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{quiz.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            ⏱ {quiz.duration} mins • 🎯 {quiz.marks} marks {quiz.topic && `• 📚 ${quiz.topic}`}
                          </p>
                        </div>
                        <Button 
                          onClick={() => startQuiz(quiz)}
                          className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg"
                        >
                          Start Quiz
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No quizzes available at the moment.</p>
              )}
            </Card>
          )}

          {activeView === "takeQuiz" && selectedQuiz && !quizResult && (
            <Card className="p-6 md:p-8 glass-card animate-fade-in-up">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold">{selectedQuiz.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Total Marks: {selectedQuiz.marks}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-lg font-bold px-4 py-2 rounded-xl ${
                    timeLeft < 60 
                      ? 'bg-destructive/15 text-destructive animate-pulse' 
                      : 'bg-primary/15 text-primary'
                  }`}>
                    ⏱ {formatTime(timeLeft)}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveView("quizList")}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Exit
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading questions...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <Card 
                      key={question.question_id} 
                      className="p-6 border border-border/50 hover:border-primary/20 transition-all animate-fade-in-up"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <h3 className="text-lg font-semibold mb-4">
                        <span className="text-primary mr-2">{index + 1}.</span>
                        {question.question_text}
                      </h3>
                      <RadioGroup
                        value={answers[question.question_id] || ""}
                        onValueChange={(key) =>
                          setAnswers({ ...answers, [question.question_id]: key })
                        }
                        className="space-y-3"
                      >
                        {Object.entries(question.options).map(([key, value]) => {
                          const isSelected = answers[question.question_id] === key;
                          return (
                            <div 
                              key={key} 
                              className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                isSelected 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-border/50 hover:border-primary/30 hover:bg-secondary/30'
                              }`}
                            >
                              <RadioGroupItem value={key} id={`${question.question_id}-${key}`} />
                              <Label 
                                htmlFor={`${question.question_id}-${key}`} 
                                className="cursor-pointer flex-1 font-medium"
                              >
                                {value}
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </Card>
                  ))}

                  <Button
                    onClick={submitQuiz}
                    disabled={!allQuestionsAnswered || loading}
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg"
                    size="lg"
                  >
                    {loading ? "Submitting..." : "Submit Quiz"}
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Review Section with Enhanced Colors */}
          {activeView === "review" && (
            <Card className="p-6 md:p-8 glass-card animate-fade-in-up">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2">Review Your <span className="gradient-text">Answers</span></h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-lg font-bold gradient-text">Score: {quizResult?.score || 0}</span>
                </div>
                
                {/* Color Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-500/20 border-2 border-emerald-500" />
                    <span className="text-muted-foreground">Correct Answer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500/20 border-2 border-red-500" />
                    <span className="text-muted-foreground">Wrong Answer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-500/20 border-2 border-amber-500" />
                    <span className="text-muted-foreground">Your Selection</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {questions.map((q, idx) => {
                  const userAnswerKey = answers[q.question_id];
                  const userAnswer = q.options[userAnswerKey];
                  const correctAnswer = correctAnswers[q.question_id] || '';
                  const isCorrect = userAnswer === correctAnswer;

                  return (
                    <Card
                      key={q.question_id}
                      className={`p-6 border-2 transition-all animate-fade-in-up ${
                        isCorrect
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-red-500/50 bg-red-500/5"
                      }`}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            isCorrect
                              ? "bg-emerald-500/20 text-emerald-600"
                              : "bg-red-500/20 text-red-600"
                          }`}
                        >
                          {isCorrect ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <XCircle className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-4">
                            {idx + 1}. {q.question_text}
                          </h3>

                          <div className="space-y-2">
                            {Object.entries(q.options).map(([key, value]) => {
                              const isUserAnswer = key === userAnswerKey;
                              const isCorrectAnswer = value === correctAnswer;
                              const isWrongSelection = isUserAnswer && !isCorrect;

                              // Determine styling based on answer status
                              let borderClass = "border-border/50 bg-secondary/20";
                              let labelClass = "";
                              let icon = null;

                              if (isCorrectAnswer) {
                                // Green for correct answer
                                borderClass = "border-emerald-500 bg-emerald-500/15";
                                labelClass = "text-emerald-700 dark:text-emerald-400";
                                icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                              } else if (isWrongSelection) {
                                // Red for wrong selection
                                borderClass = "border-red-500 bg-red-500/15";
                                labelClass = "text-red-700 dark:text-red-400";
                                icon = <XCircle className="w-4 h-4 text-red-600" />;
                              } else if (isUserAnswer && isCorrect) {
                                // Yellow/Amber for user selection that was correct
                                borderClass = "border-amber-500 bg-amber-500/15";
                                labelClass = "text-amber-700 dark:text-amber-400";
                                icon = <Circle className="w-4 h-4 text-amber-600 fill-amber-500" />;
                              }

                              return (
                                <div
                                  key={key}
                                  className={`p-3 rounded-xl border-2 transition-all ${borderClass}`}
                                >
                                  <div className="flex items-center gap-2">
                                    {icon}
                                    <span className={`font-medium ${labelClass}`}>{value}</span>
                                    {isCorrectAnswer && (
                                      <span className="ml-auto text-sm text-emerald-600 font-semibold">
                                        ✓ Correct
                                      </span>
                                    )}
                                    {isWrongSelection && (
                                      <span className="ml-auto text-sm text-red-600 font-semibold">
                                        ✗ Your Answer
                                      </span>
                                    )}
                                    {isUserAnswer && isCorrect && (
                                      <span className="ml-auto text-sm text-amber-600 font-semibold">
                                        ● Your Answer (Correct!)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground animate-pulse">
                  Redirecting to results...
                </p>
              </div>
            </Card>
          )}

          {activeView === "result" && quizResult && (
            <Card className="p-8 md:p-12 glass-card text-center animate-fade-in-up max-w-lg mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <Award className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
              <div className="text-6xl font-bold gradient-text mb-2">
                {quizResult.score || 0}
              </div>
              <p className="text-muted-foreground mb-2">out of {selectedQuiz?.marks || 0}</p>
              <p className="text-lg font-medium text-primary mb-8">
                {Math.round(((quizResult.score || 0) / (selectedQuiz?.marks || 1)) * 100)}% on {selectedQuiz?.title}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => setActiveView("quizList")} 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg"
                >
                  Take Another Quiz
                </Button>
                <Button onClick={() => setActiveView("dashboard")} variant="outline" size="lg">
                  Dashboard
                </Button>
              </div>
            </Card>
          )}

          {activeView === "viewScores" && (
            <Card className="p-8 glass-card animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My <span className="gradient-text">Scores</span></h2>
                <Button variant="outline" onClick={() => setActiveView("dashboard")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading scores...</p>
                </div>
              ) : scores.length > 0 ? (
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                        <TableHead>Quiz</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scores.map((score, index) => (
                        <TableRow key={index} className="hover:bg-secondary/20">
                          <TableCell className="font-medium">{score.quiz_title || score.quiz_id || "N/A"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{score.submitted_at || "-"}</TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary/15 text-primary">
                              {score.score || 0}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No scores yet. Take a quiz to see your results!</p>
                </div>
              )}
            </Card>
          )}

          {/* Profile Section */}
          {activeView === "profile" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My <span className="gradient-text">Profile</span></h2>
                <Button variant="outline" onClick={() => setActiveView("dashboard")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
              <UserProfile />
            </div>
          )}

          {/* Achievements Section */}
          {activeView === "achievements" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My <span className="gradient-text">Achievements</span></h2>
                <Button variant="outline" onClick={() => setActiveView("dashboard")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
              <UserAchievements scores={scores} />
            </div>
          )}

          {/* Analytics Section */}
          {activeView === "analytics" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My <span className="gradient-text">Analytics</span></h2>
                <Button variant="outline" onClick={() => setActiveView("dashboard")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
              <UserAnalytics scores={scores} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default User;
