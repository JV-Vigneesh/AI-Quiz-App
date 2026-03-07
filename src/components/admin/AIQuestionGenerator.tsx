 import { useState } from "react";
 import { Button } from "@/components/ui/button";
 import { Card } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { toast } from "@/hooks/use-toast";
 import { AWS_CONFIG } from "@/config/constants";
 import { Sparkles, Check, X, Loader2, Plus } from "lucide-react";
 
 interface GeneratedQuestion {
   question_id: string;
   question_text: string;
   options: Record<string, string>;
   answer: string;
 }
 
 interface AIQuestionGeneratorProps {
   onAddQuestion: (question: GeneratedQuestion) => void;
   existingQuestionIds: string[];
 }
 
 export const AIQuestionGenerator = ({ onAddQuestion, existingQuestionIds }: AIQuestionGeneratorProps) => {
   const [prompt, setPrompt] = useState("");
   const [numQuestions, setNumQuestions] = useState(3);
   const [topic, setTopic] = useState("");
   const [loading, setLoading] = useState(false);
   const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
 
   const generateQuestions = async () => {
     if (!prompt.trim() && !topic.trim()) {
       toast({ title: "Error", description: "Please provide a topic or prompt", variant: "destructive" });
       return;
     }
 
     const geminiApiKey = AWS_CONFIG.GEMINI_API_KEY;
     if (!geminiApiKey) {
       toast({ 
         title: "API Key Missing", 
         description: "Please add GEMINI_API_KEY to constants.ts file", 
         variant: "destructive" 
       });
       return;
     }
 
     setLoading(true);
     setGeneratedQuestions([]);
 
     try {
       // Get the highest existing question number
       const existingNumbers = existingQuestionIds
         .map(id => parseInt(id.replace(/\D/g, '')) || 0)
         .filter(n => !isNaN(n));
       const startNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
 
        const systemPrompt = `You are a quiz question generator. Generate exactly ${numQuestions} multiple choice questions about the topic.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, just pure JSON array.

Each question must have:
- question_id: starting from "Q${startNumber}" and incrementing (UPPERCASE Q)
- question_text: the question
- options: object with keys A, B, C, D and their option text values
- answer: the exact text of the correct option (not the key)

Example format:
[
  {
    "question_id": "Q${startNumber}",
    "question_text": "What is...",
    "options": {"A": "Option 1", "B": "Option 2", "C": "Option 3", "D": "Option 4"},
    "answer": "Option 1"
  }
]`;
 
       const userMessage = topic.trim() 
         ? `Generate ${numQuestions} quiz questions about: ${topic}${prompt.trim() ? `. Additional context: ${prompt}` : ''}`
         : prompt;
 
       const response = await fetch(
         `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`,
         {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             contents: [
               { role: "user", parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }
             ],
             generationConfig: {
               temperature: 0.7,
               maxOutputTokens: 4096,
             }
           })
         }
       );
 
       if (!response.ok) {
         throw new Error(`API error: ${response.status}`);
       }
 
       const data = await response.json();
       const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
 
       if (!textContent) {
         throw new Error("No response from Gemini");
       }
 
       // Clean the response - remove markdown code blocks if present
       let cleanedJson = textContent.trim();
       if (cleanedJson.startsWith("```")) {
         cleanedJson = cleanedJson.replace(/```json?\s*/gi, '').replace(/```\s*$/gi, '');
       }
 
       const questions: GeneratedQuestion[] = JSON.parse(cleanedJson);
       setGeneratedQuestions(questions);
       toast({ title: "Success", description: `Generated ${questions.length} questions!` });
     } catch (error: any) {
       console.error("Generation error:", error);
       toast({ 
         title: "Error", 
         description: error.message || "Failed to generate questions", 
         variant: "destructive" 
       });
     } finally {
       setLoading(false);
     }
   };
 
   const approveQuestion = (question: GeneratedQuestion) => {
     onAddQuestion(question);
     setGeneratedQuestions(prev => prev.filter(q => q.question_id !== question.question_id));
     toast({ title: "Added", description: `Question ${question.question_id} added to database` });
   };
 
   const rejectQuestion = (questionId: string) => {
     setGeneratedQuestions(prev => prev.filter(q => q.question_id !== questionId));
   };
 
   const approveAll = () => {
     generatedQuestions.forEach(q => onAddQuestion(q));
     setGeneratedQuestions([]);
     toast({ title: "Success", description: "All questions added to database" });
   };
 
   return (
     <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
       <div className="flex items-center gap-3 mb-6">
         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
           <Sparkles className="w-5 h-5 text-primary-foreground" />
         </div>
         <div>
           <h3 className="text-lg font-semibold">AI Question Generator</h3>
           <p className="text-sm text-muted-foreground">Generate quiz questions using Gemini AI</p>
         </div>
       </div>
 
       <div className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label htmlFor="ai-topic">Topic</Label>
             <Input
               id="ai-topic"
               value={topic}
               onChange={(e) => setTopic(e.target.value)}
               placeholder="e.g., AWS EC2, Python Basics"
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="num-questions">Number of Questions</Label>
             <Input
               id="num-questions"
               type="number"
               min={1}
               max={10}
               value={numQuestions}
               onChange={(e) => setNumQuestions(parseInt(e.target.value) || 3)}
             />
           </div>
         </div>
 
         <div className="space-y-2">
           <Label htmlFor="ai-prompt">Additional Instructions (Optional)</Label>
           <Textarea
             id="ai-prompt"
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             placeholder="e.g., Focus on beginner concepts, include code examples..."
             rows={3}
           />
         </div>
 
         <Button 
           onClick={generateQuestions} 
           disabled={loading}
           className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground gap-2"
         >
           {loading ? (
             <>
               <Loader2 className="h-4 w-4 animate-spin" />
               Generating...
             </>
           ) : (
             <>
               <Sparkles className="h-4 w-4" />
               Generate Questions
             </>
           )}
         </Button>
       </div>
 
       {generatedQuestions.length > 0 && (
         <div className="mt-6 space-y-4">
           <div className="flex justify-between items-center">
             <h4 className="font-semibold">Generated Questions</h4>
             <Button size="sm" onClick={approveAll} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
               <Check className="h-4 w-4" />
               Approve All ({generatedQuestions.length})
             </Button>
           </div>
 
           <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
             {generatedQuestions.map((q) => (
               <Card key={q.question_id} className="p-4 border border-border/50">
                 <div className="flex items-start justify-between gap-4">
                   <div className="flex-1 space-y-2">
                     <p className="font-semibold text-sm text-primary">{q.question_id}</p>
                     <p className="font-medium">{q.question_text}</p>
                     <div className="grid grid-cols-2 gap-2 text-sm">
                       {Object.entries(q.options).map(([key, value]) => (
                         <div 
                           key={key} 
                           className={`p-2 rounded-lg ${value === q.answer ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-secondary/30'}`}
                         >
                           <span className="font-bold">{key}.</span> {value}
                         </div>
                       ))}
                     </div>
                   </div>
                   <div className="flex flex-col gap-2">
                     <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950" onClick={() => approveQuestion(q)}>
                       <Check className="h-4 w-4" />
                     </Button>
                     <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => rejectQuestion(q.question_id)}>
                       <X className="h-4 w-4" />
                     </Button>
                   </div>
                 </div>
               </Card>
             ))}
           </div>
         </div>
       )}
     </Card>
   );
 };
