// AWS API Gateway endpoints - import from centralized config
import { AWS_CONFIG } from "@/config/constants";

const API_BASE_URL = AWS_CONFIG.API_BASE_URL;

// Helper to get auth headers
export const getAuthHeaders = (idToken: string) => ({
  "Authorization": `Bearer ${idToken}`,
  "Content-Type": "application/json",
});

// Quiz status types
export type QuizStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

// Admin APIs
export const adminApi = {
  addQuestion: async (idToken: string, questionData: {
    question_id: string;
    question_text: string;
    options: Record<string, string>;
    answer: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/Admin/addQuestion`, {
      method: "POST",
      headers: getAuthHeaders(idToken),
      body: JSON.stringify(questionData),
    });
    return response.json();
  },

  createQuiz: async (idToken: string, quizData: {
    quiz_id: string;
    title: string;
    question_ids: string[];
    duration: number;
    marks: number;
    created_at: string;
    topic?: string;
    status?: QuizStatus;
  }) => {
    const response = await fetch(`${API_BASE_URL}/Admin/createQuiz`, {
      method: "POST",
      headers: getAuthHeaders(idToken),
      body: JSON.stringify(quizData),
    });
    return response.json();
  },

  listQuizzes: async (idToken: string) => {
    const response = await fetch(`${API_BASE_URL}/Admin/listQuizzes`, {
      method: "GET",
      headers: getAuthHeaders(idToken),
    });
    return response.json();
  },

  updateQuiz: async (idToken: string, quizData: {
    quiz_id: string;
    title?: string;
    question_ids?: string[];
    duration?: number;
    marks?: number;
    topic?: string;
    status?: QuizStatus;
  }) => {
    const response = await fetch(`${API_BASE_URL}/Admin/listQuizzes`, {
      method: "PUT",
      headers: getAuthHeaders(idToken),
      body: JSON.stringify(quizData),
    });
    return response.json();
  },

  deleteQuiz: async (idToken: string, quizId: string) => {
    const response = await fetch(`${API_BASE_URL}/Admin/listQuizzes`, {
      method: "DELETE",
      headers: getAuthHeaders(idToken),
      body: JSON.stringify({ quiz_id: quizId }),
    });
    return response.json();
  },

  viewUsers: async (idToken: string) => {
    const response = await fetch(`${API_BASE_URL}/Admin/viewUsers`, {
      method: "GET",
      headers: getAuthHeaders(idToken),
    });
    return response.json();
  },

  viewScores: async (idToken: string) => {
    const response = await fetch(`${API_BASE_URL}/Admin/viewScores`, {
      method: "GET",
      headers: getAuthHeaders(idToken),
    });
    return response.json();
  },

  viewQuestions: async (idToken: string) => {
    const response = await fetch(`${API_BASE_URL}/Admin/viewQuestions`, {
      method: "GET",
      headers: getAuthHeaders(idToken),
    });
    return response.json();
  },

  updateQuestion: async (idToken: string, questionData: {
    question_id: string;
    question_text: string;
    options: Record<string, string>;
    answer: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/Admin/viewQuestions`, {
      method: "PUT",
      headers: getAuthHeaders(idToken),
      body: JSON.stringify(questionData),
    });
    return response.json();
  },

  deleteQuestion: async (idToken: string, questionId: string) => {
    const response = await fetch(`${API_BASE_URL}/Admin/viewQuestions`, {
      method: "DELETE",
      headers: getAuthHeaders(idToken),
      body: JSON.stringify({ question_id: questionId }),
    });
    return response.json();
  },
};

// User APIs
export const userApi = {
  listQuizzes: async (idToken: string) => {
    const response = await fetch(`${API_BASE_URL}/User/listQuizzes`, {
      method: "GET",
      headers: getAuthHeaders(idToken),
    });
    return response.json();
  },

  getQuizQuestions: async (idToken: string, quizId: string) => {
    const response = await fetch(`${API_BASE_URL}/User/getQuizQuestions?quiz_id=${quizId}`, {
      method: "GET",
      headers: getAuthHeaders(idToken),
    });
    return response.json();
  },

  submitQuiz: async (idToken: string, quizId: string, answers: Record<string, string>, quizTitle?: string, quizTopic?: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const formattedTimestamp = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const response = await fetch(`${API_BASE_URL}/User/submitQuiz`, {
      method: "POST",
      headers: getAuthHeaders(idToken),
      body: JSON.stringify({
        quiz_id: quizId,
        quiz_title: quizTitle,
        answers,
        submitted_at: formattedTimestamp,
      }),
    });
    return response.json();
  },

  viewScore: async (idToken: string) => {
    const response = await fetch(`${API_BASE_URL}/User/viewScore`, {
      method: "GET",
      headers: getAuthHeaders(idToken),
    });
    return response.json();
  },
};
