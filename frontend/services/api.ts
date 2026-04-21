import axios from "axios";
import {
  UserStats,
  ChatMessage,
  HintResponse,
  PracticeProblem,
} from "../types";

const API_BASE_URL = "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// For demonstration, these include fallbacks to simulated data if the backend is unavailable
export const api = {
  extractProblem: async (): Promise<{ text: string }> => {
    try {
      const response = await client.post("/extract-problem");
      return response.data;
    } catch (error) {
      console.warn("API unavailable, returning mock data");
      return { text: "Calculate the integral of sin(x) from 0 to π/2." };
    }
  },

  // sendChatMessage: async (message: string): Promise<{ reply: string }> => {
  //   try {
  //     const response = await client.post("/chat", { message });
  //     return response.data;
  //   } catch (error) {
  //     return {
  //       reply:
  //         "I'm currently processing your request. Based on the problem, I suggest looking at the integration rules for trigonometric functions.",
  //     };
  //   }
  // },

  // uploadPDF: async (file: File): Promise<{ text: string }> => {
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   try {
  //     const response = await client.post("/upload-pdf", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  //     return response.data;
  //   } catch (error) {
  //     return {
  //       text: "Simulated PDF Content: Problem 1: Find the value of x in 2x + 5 = 15. Problem 2: Geometry proofs of parallel lines.",
  //     };
  //   }
  // },

  generateHint: async (
    problemId: string,
    level: number,
  ): Promise<HintResponse> => {
    try {
      const response = await client.post("/generate-hint", {
        problemId,
        level,
      });
      return response.data;
    } catch (error) {
      const hints = [
        "Think about the derivative of cosine.",
        "Remember that ∫sin(x)dx = -cos(x) + C.",
        "Substitute the upper and lower limits: -cos(π/2) - (-cos(0)).",
      ];
      return {
        level: level,
        text: hints[Math.min(level - 1, 2)],
        isFullSolution: level === 3,
      };
    }
  },

  // generatePractice: async (context: string): Promise<PracticeProblem> => {
  //   try {
  //     const response = await client.post("/generate-practice", { context });
  //     return response.data;
  //   } catch (error) {
  //     return {
  //       id: Math.random().toString(36),
  //       title: "Calculus Practice",
  //       content: "Determine the area under the curve y = x^2 from x=0 to x=3.",
  //       difficulty: "Medium",
  //     };
  //   }
  // },

  getUserStats: async (): Promise<UserStats> => {
    try {
      const response = await client.get("/user-stats");
      return response.data;
    } catch (error) {
      return {
        totalProblems: 42,
        avgHints: 1.4,
        accuracy: 85,
        difficultyLevel: "Intermediate",
        progressData: [
          { date: "Mon", solved: 4 },
          { date: "Tue", solved: 7 },
          { date: "Wed", solved: 5 },
          { date: "Thu", solved: 8 },
          { date: "Fri", solved: 10 },
          { date: "Sat", solved: 6 },
          { date: "Sun", solved: 2 },
        ],
      };
    }
  },

  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email); // IMPORTANT: username = email
    formData.append("password", password);

    const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data; // { access_token, token_type }
  },

  register: async (name: string, email: string, password: string) => {
    console.log(name, email, password);
    const response = await client.post("/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  },

  getDashboard: async (userId: number) => {
    try {
      const response = await client.get(`/dashboard/dashboard/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Dashboard fetch failed:", error);
      throw error;
    }
  },

  getProfile: async () => {
    const response = await client.get("/users/me");
    return response.data;
  },

  updateProfile: async (data: { name: string; email: string }) => {
    const response = await client.put("/users/me", data);
    return response.data;
  },

  uploadPDF: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await client.post("/pdf/pdf/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  generatePDFHint: async (question: string, level: number) => {
    try {
      const response = await client.post("/hints/pdf", {
        question,
        level,
      });
      console.log(response);
      return response.data;
    } catch (error: any) {
      console.error("PDF Hint Error:");

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error(
          "Full error data:",
          JSON.stringify(error.response.data, null, 2),
        );
      } else {
        console.error(error);
      }

      throw error;
    }
  },

  sendChatMessage: async (
    message: string,
  ): Promise<{
    type: string;
    problem_id: number;
    response: string;
  }> => {
    try {
      const response = await client.post(
        `/chatbot/chatbot/?message=${encodeURIComponent(message)}`,
      );

      return response.data;
    } catch (error) {
      console.error("Chatbot error:", error);

      return {
        type: "error",
        problem_id: -1,
        response: "⚠️ Unable to connect to AI tutor. Please check your server.",
      };
    }
  },

  generatePractice: async (
    topic?: string,
  ): Promise<{
    mode: string;
    topic: string;
    mastery_score: number;
    problem_id: number;
    title: string;
    description: string;
  }> => {
    try {
      const response = await client.post(
        topic ? `/practice/?topic=${encodeURIComponent(topic)}` : "/",
      );

      return response.data;
    } catch (error) {
      console.error("Practice generation failed:", error);
      throw error;
    }
  },

  extractScreenProblem: async (
    image: string,
  ): Promise<{ extracted_text: string; problem_id: number }> => {
    try {
      const response = await client.post("/screen/extract-problem", {
        image,
      });

      return response.data;
    } catch (error) {
      console.warn("Screen API failed, returning mock");

      return {
        extracted_text: "Mock problem: Find derivative of x^2",
        problem_id: 1,
      };
    }
  },
};
