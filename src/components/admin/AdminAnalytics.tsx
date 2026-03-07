 import { Card } from "@/components/ui/card";
 import { BarChart3, Users, BookOpen, Award, TrendingUp, TrendingDown, Minus } from "lucide-react";
 import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
 import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
 
 interface AdminAnalyticsProps {
   users: any[];
   quizzes: any[];
   scores: any[];
   questions: any[];
 }
 
 export const AdminAnalytics = ({ users, quizzes, scores, questions }: AdminAnalyticsProps) => {
   // Calculate stats
   const totalUsers = users.length;
   const totalQuizzes = quizzes.length;
   const totalQuestions = questions.length;
   const totalAttempts = scores.length;
 
   // Calculate average score
   const avgScore = scores.length > 0 
     ? Math.round(scores.reduce((acc, s) => acc + (s.score || 0), 0) / scores.length)
     : 0;
 
   // Quiz status distribution
   const quizStatusData = [
     { name: "Published", value: quizzes.filter(q => q.status === "PUBLISHED").length, color: "hsl(var(--primary))" },
     { name: "Draft", value: quizzes.filter(q => q.status === "DRAFT").length, color: "hsl(var(--accent))" },
     { name: "Closed", value: quizzes.filter(q => q.status === "CLOSED").length, color: "hsl(var(--muted-foreground))" },
   ].filter(d => d.value > 0);
 
   // Top performing quizzes
   const quizScoreMap = new Map<string, { title: string; scores: number[]; attempts: number }>();
   scores.forEach(s => {
     const key = s.quiz_id;
     if (!quizScoreMap.has(key)) {
       const quiz = quizzes.find(q => q.quiz_id === key);
       quizScoreMap.set(key, { 
         title: s.quiz_title || quiz?.title || key, 
         scores: [], 
         attempts: 0 
       });
     }
     const entry = quizScoreMap.get(key)!;
     entry.scores.push(s.score || 0);
     entry.attempts++;
   });
 
   const quizPerformance = Array.from(quizScoreMap.entries())
     .map(([id, data]) => ({
       name: data.title.length > 15 ? data.title.substring(0, 15) + "..." : data.title,
       avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
       attempts: data.attempts,
     }))
     .sort((a, b) => b.attempts - a.attempts)
     .slice(0, 5);
 
   const stats = [
     { label: "Total Users", value: totalUsers, icon: Users, trend: "up" },
     { label: "Total Quizzes", value: totalQuizzes, icon: BookOpen, trend: "neutral" },
     { label: "Total Questions", value: totalQuestions, icon: BarChart3, trend: "up" },
     { label: "Quiz Attempts", value: totalAttempts, icon: Award, trend: "up" },
   ];
 
   const getTrendIcon = (trend: string) => {
     if (trend === "up") return <TrendingUp className="w-4 h-4 text-emerald-500" />;
     if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-500" />;
     return <Minus className="w-4 h-4 text-muted-foreground" />;
   };
 
   return (
     <div className="space-y-6">
       {/* Stats Grid */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         {stats.map((stat, index) => {
           const Icon = stat.icon;
           return (
             <Card 
               key={stat.label} 
               className="p-5 glass-card animate-fade-in-up"
               style={{ animationDelay: `${index * 80}ms` }}
             >
               <div className="flex items-center justify-between mb-3">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                   <Icon className="w-5 h-5 text-primary" />
                 </div>
                 {getTrendIcon(stat.trend)}
               </div>
               <p className="text-2xl font-bold">{stat.value}</p>
               <p className="text-sm text-muted-foreground">{stat.label}</p>
             </Card>
           );
         })}
       </div>
 
       <div className="grid md:grid-cols-2 gap-6">
         {/* Quiz Performance Chart */}
         <Card className="p-6 glass-card">
           <h3 className="text-lg font-semibold mb-4">Quiz Performance</h3>
           {quizPerformance.length > 0 ? (
             <ChartContainer config={{ avgScore: { label: "Avg Score", color: "hsl(var(--primary))" } }} className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={quizPerformance} layout="vertical">
                   <XAxis type="number" />
                   <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                   <ChartTooltip content={<ChartTooltipContent />} />
                   <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={4} />
                 </BarChart>
               </ResponsiveContainer>
             </ChartContainer>
           ) : (
             <div className="h-[250px] flex items-center justify-center text-muted-foreground">
               No data available yet
             </div>
           )}
         </Card>
 
         {/* Quiz Status Distribution */}
         <Card className="p-6 glass-card">
           <h3 className="text-lg font-semibold mb-4">Quiz Status Distribution</h3>
           {quizStatusData.length > 0 ? (
             <ChartContainer config={{}} className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={quizStatusData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={90}
                     paddingAngle={5}
                     dataKey="value"
                     label={({ name, value }) => `${name}: ${value}`}
                   >
                     {quizStatusData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <ChartTooltip content={<ChartTooltipContent />} />
                 </PieChart>
               </ResponsiveContainer>
             </ChartContainer>
           ) : (
             <div className="h-[250px] flex items-center justify-center text-muted-foreground">
               No quizzes yet
             </div>
           )}
         </Card>
       </div>
 
       {/* Summary Cards */}
       <div className="grid md:grid-cols-3 gap-4">
         <Card className="p-5 glass-card">
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
               <TrendingUp className="w-6 h-6 text-emerald-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-emerald-600">{avgScore}</p>
               <p className="text-sm text-muted-foreground">Average Score</p>
             </div>
           </div>
         </Card>
         
         <Card className="p-5 glass-card">
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
               <BookOpen className="w-6 h-6 text-primary" />
             </div>
             <div>
               <p className="text-2xl font-bold text-primary">{quizzes.filter(q => q.status === "PUBLISHED").length}</p>
               <p className="text-sm text-muted-foreground">Active Quizzes</p>
             </div>
           </div>
         </Card>
         
         <Card className="p-5 glass-card">
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center">
               <Users className="w-6 h-6 text-accent" />
             </div>
             <div>
               <p className="text-2xl font-bold text-accent">{users.filter(u => u.group !== "Admins").length}</p>
               <p className="text-sm text-muted-foreground">Regular Users</p>
             </div>
           </div>
         </Card>
       </div>
     </div>
   );
 };