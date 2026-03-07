 import { Card } from "@/components/ui/card";
 import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
 import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
 import { TrendingUp, Target, BookOpen, Award } from "lucide-react";
 
 interface Score {
   quiz_id: string;
   quiz_title?: string;
   quiz_topic?: string;
   score: number;
   max_score?: number;
   submitted_at?: string;
 }
 
 interface UserAnalyticsProps {
   scores: Score[];
 }
 
 export const UserAnalytics = ({ scores }: UserAnalyticsProps) => {
   // Calculate stats
   const totalQuizzes = scores.length;
   const totalScore = scores.reduce((acc, s) => acc + (s.score || 0), 0);
   const avgScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
   const highestScore = totalQuizzes > 0 ? Math.max(...scores.map(s => s.score || 0)) : 0;
 
   // Score progression (last 10 quizzes)
   const progressionData = scores
     .slice(-10)
     .map((s, index) => ({
       quiz: s.quiz_title?.substring(0, 10) || `Quiz ${index + 1}`,
       score: s.score || 0,
     }));
 
   // Performance by topic
   const topicMap = new Map<string, { scores: number[]; total: number }>();
   scores.forEach(s => {
     const topic = s.quiz_topic || "General";
     if (!topicMap.has(topic)) {
       topicMap.set(topic, { scores: [], total: 0 });
     }
     topicMap.get(topic)!.scores.push(s.score || 0);
     topicMap.get(topic)!.total++;
   });
 
   const topicData = Array.from(topicMap.entries())
     .map(([topic, data]) => ({
       topic: topic.length > 12 ? topic.substring(0, 12) + "..." : topic,
       avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
       count: data.total,
     }))
     .sort((a, b) => b.count - a.count)
     .slice(0, 5);
 
   const stats = [
     { label: "Quizzes Taken", value: totalQuizzes, icon: BookOpen, color: "text-primary" },
     { label: "Total Points", value: totalScore, icon: Award, color: "text-accent" },
     { label: "Average Score", value: `${avgScore}%`, icon: Target, color: "text-emerald-500" },
     { label: "Highest Score", value: highestScore, icon: TrendingUp, color: "text-amber-500" },
   ];
 
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
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                   <Icon className={`w-5 h-5 ${stat.color}`} />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{stat.value}</p>
                   <p className="text-xs text-muted-foreground">{stat.label}</p>
                 </div>
               </div>
             </Card>
           );
         })}
       </div>
 
       {/* Charts Grid */}
       <div className="grid md:grid-cols-2 gap-6">
         {/* Score Progression */}
         <Card className="p-6 glass-card">
           <h3 className="text-lg font-semibold mb-4">Score Progression</h3>
           {progressionData.length > 0 ? (
             <ChartContainer config={{ score: { label: "Score", color: "hsl(var(--primary))" } }} className="h-[220px]">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={progressionData}>
                   <defs>
                     <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="quiz" tick={{ fontSize: 10 }} />
                   <YAxis />
                   <ChartTooltip content={<ChartTooltipContent />} />
                   <Area 
                     type="monotone" 
                     dataKey="score" 
                     stroke="hsl(var(--primary))" 
                     fill="url(#scoreGradient)"
                     strokeWidth={2}
                   />
                 </AreaChart>
               </ResponsiveContainer>
             </ChartContainer>
           ) : (
             <div className="h-[220px] flex items-center justify-center text-muted-foreground">
               Take quizzes to see your progression
             </div>
           )}
         </Card>
 
         {/* Performance by Topic */}
         <Card className="p-6 glass-card">
           <h3 className="text-lg font-semibold mb-4">Performance by Topic</h3>
           {topicData.length > 0 ? (
             <ChartContainer config={{ avgScore: { label: "Avg Score", color: "hsl(var(--accent))" } }} className="h-[220px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={topicData} layout="vertical">
                   <XAxis type="number" />
                   <YAxis dataKey="topic" type="category" width={80} tick={{ fontSize: 11 }} />
                   <ChartTooltip content={<ChartTooltipContent />} />
                   <Bar dataKey="avgScore" fill="hsl(var(--accent))" radius={4} />
                 </BarChart>
               </ResponsiveContainer>
             </ChartContainer>
           ) : (
             <div className="h-[220px] flex items-center justify-center text-muted-foreground">
               No topic data available yet
             </div>
           )}
         </Card>
       </div>
 
       {/* Recent Quiz Summary */}
       {scores.length > 0 && (
         <Card className="p-6 glass-card">
           <h3 className="text-lg font-semibold mb-4">Recent Quizzes</h3>
           <div className="space-y-3">
             {scores.slice(-5).reverse().map((score, index) => (
               <div 
                 key={index}
                 className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 animate-fade-in-up"
                 style={{ animationDelay: `${index * 60}ms` }}
               >
                 <div>
                   <p className="font-medium">{score.quiz_title || score.quiz_id}</p>
                   {score.quiz_topic && (
                     <p className="text-sm text-muted-foreground">{score.quiz_topic}</p>
                   )}
                 </div>
                 <div className="text-right">
                   <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary/15 text-primary">
                     {score.score} pts
                   </span>
                 </div>
               </div>
             ))}
           </div>
         </Card>
       )}
     </div>
   );
 };