 import { Card } from "@/components/ui/card";
 import { Progress } from "@/components/ui/progress";
 import { 
   Trophy, 
   Star, 
   Target, 
   Zap, 
   Medal,
   Crown,
   Flame,
   Award
 } from "lucide-react";
 
 interface Score {
   quiz_id: string;
   quiz_title?: string;
   score: number;
   max_score?: number;
 }
 
 interface UserAchievementsProps {
   scores: Score[];
 }
 
 export const UserAchievements = ({ scores }: UserAchievementsProps) => {
   // Calculate stats
   const totalScore = scores.reduce((acc, s) => acc + (s.score || 0), 0);
   const quizzesTaken = scores.length;
   const perfectScores = scores.filter(s => s.score >= (s.max_score || 100)).length;
   const avgScore = quizzesTaken > 0 ? Math.round(totalScore / quizzesTaken) : 0;
 
   // Achievement logic
   const achievements = [
     {
       id: "first_quiz",
       icon: Star,
       title: "First Steps",
       description: "Complete your first quiz",
       unlocked: quizzesTaken >= 1,
       progress: Math.min(quizzesTaken, 1),
       target: 1,
     },
     {
       id: "quiz_master",
       icon: Trophy,
       title: "Quiz Master",
       description: "Complete 5 quizzes",
       unlocked: quizzesTaken >= 5,
       progress: Math.min(quizzesTaken, 5),
       target: 5,
     },
     {
       id: "dedicated_learner",
       icon: Medal,
       title: "Dedicated Learner",
       description: "Complete 10 quizzes",
       unlocked: quizzesTaken >= 10,
       progress: Math.min(quizzesTaken, 10),
       target: 10,
     },
     {
       id: "perfectionist",
       icon: Crown,
       title: "Perfectionist",
       description: "Get a perfect score on any quiz",
       unlocked: perfectScores >= 1,
       progress: Math.min(perfectScores, 1),
       target: 1,
     },
     {
       id: "high_achiever",
       icon: Zap,
       title: "High Achiever",
       description: "Maintain average score above 80%",
       unlocked: avgScore >= 80 && quizzesTaken > 0,
       progress: avgScore,
       target: 80,
       isPercentage: true,
     },
     {
       id: "on_fire",
       icon: Flame,
       title: "On Fire",
       description: "Score above 90% on 3 quizzes",
       unlocked: scores.filter(s => (s.score / (s.max_score || 100)) * 100 >= 90).length >= 3,
       progress: scores.filter(s => (s.score / (s.max_score || 100)) * 100 >= 90).length,
       target: 3,
     },
   ];
 
   const unlockedCount = achievements.filter(a => a.unlocked).length;
 
   // Get encouraging message based on performance
   const getMessage = () => {
     if (quizzesTaken === 0) return { message: "Take your first quiz to start your journey!", emoji: "🚀" };
     if (avgScore >= 90) return { message: "Outstanding performance! You're a true champion!", emoji: "🏆" };
     if (avgScore >= 80) return { message: "Great job! Keep up the excellent work!", emoji: "🌟" };
     if (avgScore >= 70) return { message: "Good progress! You're getting better every day!", emoji: "💪" };
     if (avgScore >= 60) return { message: "Nice effort! Practice makes perfect!", emoji: "📚" };
     return { message: "Keep learning! Every quiz makes you smarter!", emoji: "🎯" };
   };
 
   const { message, emoji } = getMessage();
 
   return (
     <div className="space-y-6">
       {/* Total Score Card */}
       <Card className="p-8 glass-card bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/20">
         <div className="text-center">
           <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse-glow">
             <Award className="w-10 h-10 text-primary-foreground" />
           </div>
           <p className="text-muted-foreground mb-2">Total Score</p>
           <p className="text-5xl font-bold gradient-text mb-2">{totalScore}</p>
           <p className="text-lg text-muted-foreground">{message} {emoji}</p>
         </div>
       </Card>
 
       {/* Stats Grid */}
       <div className="grid grid-cols-3 gap-4">
         <Card className="p-4 glass-card text-center">
           <p className="text-3xl font-bold text-primary">{quizzesTaken}</p>
           <p className="text-sm text-muted-foreground">Quizzes Taken</p>
         </Card>
         <Card className="p-4 glass-card text-center">
           <p className="text-3xl font-bold text-accent">{avgScore}%</p>
           <p className="text-sm text-muted-foreground">Average Score</p>
         </Card>
         <Card className="p-4 glass-card text-center">
           <p className="text-3xl font-bold text-emerald-500">{perfectScores}</p>
           <p className="text-sm text-muted-foreground">Perfect Scores</p>
         </Card>
       </div>
 
       {/* Achievements */}
       <Card className="p-6 glass-card">
         <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-semibold">Achievements</h3>
           <span className="text-sm text-muted-foreground">{unlockedCount}/{achievements.length} Unlocked</span>
         </div>
 
         <div className="grid gap-4">
           {achievements.map((achievement, index) => {
             const Icon = achievement.icon;
             const progressPercent = achievement.isPercentage 
               ? Math.min((achievement.progress / achievement.target) * 100, 100)
               : (achievement.progress / achievement.target) * 100;
 
             return (
               <div 
                 key={achievement.id}
                 className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all animate-fade-in-up ${
                   achievement.unlocked 
                     ? "border-primary/30 bg-primary/5" 
                     : "border-border/50 bg-secondary/20 opacity-70"
                 }`}
                 style={{ animationDelay: `${index * 80}ms` }}
               >
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                   achievement.unlocked 
                     ? "bg-gradient-to-br from-primary to-accent" 
                     : "bg-muted"
                 }`}>
                   <Icon className={`w-6 h-6 ${achievement.unlocked ? "text-primary-foreground" : "text-muted-foreground"}`} />
                 </div>
                 <div className="flex-1">
                   <div className="flex items-center gap-2">
                     <p className="font-semibold">{achievement.title}</p>
                     {achievement.unlocked && (
                       <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-medium">
                         Unlocked!
                       </span>
                     )}
                   </div>
                   <p className="text-sm text-muted-foreground">{achievement.description}</p>
                   {!achievement.unlocked && (
                     <div className="mt-2">
                       <Progress value={progressPercent} className="h-2" />
                       <p className="text-xs text-muted-foreground mt-1">
                         {achievement.isPercentage 
                           ? `${achievement.progress}% / ${achievement.target}%`
                           : `${achievement.progress} / ${achievement.target}`
                         }
                       </p>
                     </div>
                   )}
                 </div>
               </div>
             );
           })}
         </div>
       </Card>
     </div>
   );
 };