import { tool } from "ai";
import { z } from "zod";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface QuizTemplate {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  category: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit?: number; // in minutes
  passingScore?: number; // percentage
}

export const createQuiz = tool({
  description:
    "Create a dynamic quiz template with 4-choice multiple choice questions. Generate questions based on the given topic and parameters.",
  inputSchema: z.object({
    topic: z.string().describe("The topic for the quiz (e.g., 'JavaScript basics', 'World History', 'Biology')"),
    numberOfQuestions: z.number().min(1).max(20).default(5).describe("Number of questions to generate (1-20)"),
    difficulty: z.enum(["easy", "medium", "hard"]).default("medium").describe("Difficulty level of the quiz"),
    category: z.string().optional().describe("Category for the quiz (e.g., 'Programming', 'Science', 'History')"),
    timeLimit: z.number().optional().describe("Time limit in minutes (optional)"),
    passingScore: z.number().min(0).max(100).default(70).describe("Passing score percentage (0-100)"),
    includeExplanations: z.boolean().default(true).describe("Whether to include explanations for correct answers"),
  }),
  execute: async (input) => {
    try {
      // Generate quiz questions based on the topic
      const quizTemplate: QuizTemplate = {
        id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${input.topic} Quiz`,
        description: `Test your knowledge of ${input.topic} with this ${input.difficulty} level quiz.`,
        category: input.category || "General Knowledge",
        difficulty: input.difficulty,
        timeLimit: input.timeLimit,
        passingScore: input.passingScore,
        questions: []
      };

      // Generate questions (in a real implementation, this would use AI to generate questions)
      const questions = await generateQuizQuestions(
        input.topic,
        input.numberOfQuestions,
        input.difficulty,
        input.includeExplanations
      );

      quizTemplate.questions = questions;

      return {
        success: true,
        quiz: quizTemplate,
        message: `Successfully created quiz with ${questions.length} questions about ${input.topic}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create quiz: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
});

async function generateQuizQuestions(
  topic: string,
  count: number,
  difficulty: "easy" | "medium" | "hard",
  includeExplanations: boolean
): Promise<QuizQuestion[]> {
  // This is a placeholder implementation
  // In a real application, you would use an AI service to generate questions based on the topic
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < count; i++) {
    questions.push({
      id: `q-${i + 1}`,
      question: `Sample question ${i + 1} about ${topic}?`,
      options: [
        `Option A for question ${i + 1}`,
        `Option B for question ${i + 1}`,
        `Option C for question ${i + 1}`,
        `Option D for question ${i + 1}`
      ],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: includeExplanations ? `Explanation for question ${i + 1} about ${topic}.` : undefined,
      category: topic,
      difficulty
    });
  }

  return questions;
}
