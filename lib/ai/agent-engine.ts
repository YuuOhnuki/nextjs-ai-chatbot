import { generateText } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { createMockAgent, executeMockAgentTask, updateMockAgentPlan } from "@/lib/ai/tools/agent";
import { webSearchTool } from "@/lib/ai/tools/web-search";
import type { AgentPlan, AgentTask } from "@/lib/ai/tools/agent";

interface AgentEngineOptions {
  goal: string;
  context?: string;
  constraints?: string[];
  webSearchEnabled: boolean;
  maxTasks: number;
  onProgressUpdate?: (agent: AgentPlan) => void;
  onTaskStart?: (task: AgentTask) => void;
  onTaskComplete?: (task: AgentTask, result: any) => void;
  onAgentComplete?: (agent: AgentPlan) => void;
}

export class AgentEngine {
  private agent: AgentPlan | null = null;
  private isExecuting = false;
  private executionQueue: AgentTask[] = [];
  private currentTaskIndex = 0;

  constructor(private options: AgentEngineOptions) {}

  async startExecution(): Promise<AgentPlan> {
    if (this.isExecuting) {
      throw new Error("Agent is already executing");
    }

    this.isExecuting = true;

    try {
      // Step 1: Create agent plan
      this.agent = await this.createAgentPlan();
      this.options.onProgressUpdate?.(this.agent);

      // Step 2: Start executing tasks
      await this.executeTasks();

      return this.agent;
    } catch (error) {
      this.isExecuting = false;
      throw error;
    }
  }

  private async createAgentPlan(): Promise<AgentPlan> {
    // Use AI to analyze the goal and create tasks
    const taskAnalysis = await this.analyzeGoalWithAI();
    
    // Create agent using the helper function
    const agentResult = await createMockAgent({
      goal: this.options.goal,
      context: this.options.context,
      constraints: this.options.constraints,
      priority: "medium",
      estimatedTime: taskAnalysis.estimatedTime,
      allowAutonomousExecution: true,
      maxTasks: this.options.maxTasks,
    });

    if (!agentResult.success || !agentResult.plan) {
      throw new Error("Failed to create agent plan");
    }

    return agentResult.plan;
  }

  private async analyzeGoalWithAI(): Promise<{
    tasks: AgentTask[];
    estimatedTime: number;
  }> {
    const prompt = `Analyze the following goal and break it down into specific, actionable tasks:

Goal: ${this.options.goal}
${this.options.context ? `Context: ${this.options.context}` : ""}
${this.options.constraints?.length ? `Constraints: ${this.options.constraints.join(", ")}` : ""}

Please break this down into 3-7 specific tasks that can be executed sequentially. For each task, provide:
1. A clear title
2. A detailed description
3. The type of task (research, analysis, creation, organization)
4. Estimated time in minutes
5. Priority level

Respond in JSON format with this structure:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed description",
      "type": "research|analysis|creation|organization",
      "estimatedTime": 30,
      "priority": "high|medium|low"
    }
  ],
  "estimatedTime": 120
}`;

    try {
      const response = await generateText({
        model: myProvider.languageModel("chat-model"),
        prompt,
        temperature: 0.3
      });

      const analysis = JSON.parse(response.text);
      return analysis;
    } catch (error) {
      console.error("Failed to analyze goal with AI:", error);
      
      // Fallback to basic task creation
      return {
        tasks: this.createFallbackTasks(),
        estimatedTime: 60
      };
    }
  }

  private createFallbackTasks(): AgentTask[] {
    const timestamp = Date.now();
    return [
      {
        id: `task-${timestamp}-1`,
        title: "Analyze requirements",
        description: `Analyze the requirements for: ${this.options.goal}`,
        type: "analysis",
        priority: "high",
        status: "pending",
        estimatedTime: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `task-${timestamp}-2`,
        title: "Gather information",
        description: "Gather necessary information and resources",
        type: "research",
        priority: "high",
        status: "pending",
        estimatedTime: 30,
        dependencies: [`task-${timestamp}-1`],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `task-${timestamp}-3`,
        title: "Execute main task",
        description: `Execute the main task: ${this.options.goal}`,
        type: "creation",
        priority: "medium",
        status: "pending",
        estimatedTime: 45,
        dependencies: [`task-${timestamp}-1`, `task-${timestamp}-2`],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private async executeTasks(): Promise<void> {
    if (!this.agent) return;

    this.executionQueue = [...this.agent.tasks];
    this.currentTaskIndex = 0;

    while (this.currentTaskIndex < this.executionQueue.length && this.isExecuting) {
      const currentTask = this.executionQueue[this.currentTaskIndex];
      
      try {
        await this.executeSingleTask(currentTask);
        this.currentTaskIndex++;
      } catch (error) {
        console.error(`Failed to execute task ${currentTask.title}:`, error);
        
        // Mark task as failed but continue with next tasks
        if (this.agent) {
          this.agent = await updateMockAgentPlan({
            agentId: this.agent.id,
            updates: {
              updateTaskStatus: [{
                taskId: currentTask.id,
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown error"
              }]
            }
          });
          this.options.onProgressUpdate?.(this.agent);
        }
      }
    }

    // Mark agent as completed
    if (this.agent) {
      this.agent.status = "completed";
      this.agent.progress = 100;
      this.agent.updatedAt = new Date();
      this.options.onProgressUpdate?.(this.agent);
      this.options.onAgentComplete?.(this.agent);
    }

    this.isExecuting = false;
  }

  private async executeSingleTask(task: AgentTask): Promise<void> {
    if (!this.agent) return;

    // Update task status to in_progress
    this.agent = await updateMockAgentPlan({
      agentId: this.agent.id,
      updates: {
        updateTaskStatus: [{ taskId: task.id, status: "in_progress" }]
      }
    });
    this.options.onProgressUpdate?.(this.agent!);
    this.options.onTaskStart?.(task);

    try {
      let result: any;

      // Execute task based on type
      switch (task.type) {
        case "research":
          result = await this.executeResearchTask(task);
          break;
        case "analysis":
          result = await this.executeAnalysisTask(task);
          break;
        case "creation":
          result = await this.executeCreationTask(task);
          break;
        case "organization":
          result = await this.executeOrganizationTask(task);
          break;
        default:
          result = await this.executeGenericTask(task);
      }

      // Update task status to completed
      this.agent = await updateMockAgentPlan({
        agentId: this.agent.id,
        updates: {
          updateTaskStatus: [{
            taskId: task.id,
            status: "completed",
            result
          }]
        }
      });

      // Update overall progress
      const completedTasks = this.agent.tasks.filter(t => t.status === "completed").length;
      this.agent.progress = (completedTasks / this.agent.tasks.length) * 100;

      this.options.onProgressUpdate?.(this.agent!);
      this.options.onTaskComplete?.(task, result);

    } catch (error) {
      // Mark task as failed
      this.agent = await updateMockAgentPlan({
        agentId: this.agent.id,
        updates: {
          updateTaskStatus: [{
            taskId: task.id,
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error"
          }]
        }
      });
      this.options.onProgressUpdate?.(this.agent!);
      throw error;
    }
  }

  private async executeResearchTask(task: AgentTask): Promise<any> {
    if (this.options.webSearchEnabled) {
      // Use web search for research tasks
      const searchQuery = `${task.title} ${task.description}`;
      const searchResult = await webSearchTool({
        query: searchQuery,
        searchType: "web",
        maxResults: 5,
        language: "en",
        safeSearch: "moderate",
        sortBy: "relevance",
        timeRange: "any"
      });

      if (searchResult.success) {
        return {
          type: "research",
          findings: searchResult.results,
          query: searchQuery,
          summary: `Found ${searchResult.totalResults} results for research task`
        };
      }
    }

    // Fallback to AI-based research
    const researchPrompt = `Research the following topic: ${task.title}
Description: ${task.description}

Please provide comprehensive research findings including:
1. Key information and facts
2. Relevant sources or references
3. Insights and analysis
4. Recommendations based on findings`;

    const response = await generateText({
      model: myProvider.languageModel("chat-model"),
      prompt: researchPrompt,
      temperature: 0.3
    });

    return {
      type: "research",
      findings: response.text,
      sources: ["AI-generated research"],
      summary: `Research completed for: ${task.title}`
    };
  }

  private async executeAnalysisTask(task: AgentTask): Promise<any> {
    const analysisPrompt = `Analyze the following: ${task.title}
Description: ${task.description}

Please provide detailed analysis including:
1. Key components and factors
2. Relationships and dependencies
3. Strengths and weaknesses
4. Opportunities and threats
5. Recommendations and next steps`;

    const response = await generateText({
      model: myProvider.languageModel("chat-model"),
      prompt: analysisPrompt,
      temperature: 0.2
    });

    return {
      type: "analysis",
      analysis: response.text,
      insights: ["AI-generated analysis"],
      recommendations: ["Based on AI analysis"]
    };
  }

  private async executeCreationTask(task: AgentTask): Promise<any> {
    const creationPrompt = `Create the following: ${task.title}
Description: ${task.description}

Please create the requested content with:
1. Clear structure and organization
2. High quality and accuracy
3. Appropriate format and style
4. Complete and comprehensive coverage`;

    const response = await generateText({
      model: myProvider.languageModel("chat-model"),
      prompt: creationPrompt,
      temperature: 0.4
    });

    return {
      type: "creation",
      created: response.text,
      format: "text",
      summary: `Created: ${task.title}`
    };
  }

  private async executeOrganizationTask(task: AgentTask): Promise<any> {
    const organizationPrompt = `Organize the following: ${task.title}
Description: ${task.description}

Please provide organized structure including:
1. Categories and classifications
2. Hierarchical arrangement
3. Logical flow and sequence
4. Actionable organization plan`;

    const response = await generateText({
      model: myProvider.languageModel("chat-model"),
      prompt: organizationPrompt,
      temperature: 0.3
    });

    return {
      type: "organization",
      structure: response.text,
      categories: ["AI-generated organization"],
      summary: `Organized: ${task.title}`
    };
  }

  private async executeGenericTask(task: AgentTask): Promise<any> {
    const genericPrompt = `Execute the following task: ${task.title}
Description: ${task.description}

Please complete this task effectively and provide:
1. Task execution results
2. Key outcomes and deliverables
3. Status and completion notes`;

    const response = await generateText({
      model: myProvider.languageModel("chat-model"),
      prompt: genericPrompt,
      temperature: 0.3
    });

    return {
      type: "generic",
      result: response.text,
      summary: `Completed: ${task.title}`
    };
  }

  pauseExecution(): void {
    this.isExecuting = false;
    if (this.agent) {
      this.agent.status = "paused";
      this.options.onProgressUpdate?.(this.agent);
    }
  }

  resumeExecution(): void {
    this.isExecuting = true;
    if (this.agent) {
      this.agent.status = "executing";
      this.options.onProgressUpdate?.(this.agent);
      this.executeTasks(); // Resume from current task
    }
  }

  stopExecution(): void {
    this.isExecuting = false;
    if (this.agent) {
      this.agent.status = "failed";
      this.options.onProgressUpdate?.(this.agent);
    }
  }

  getCurrentAgent(): AgentPlan | null {
    return this.agent;
  }

  isCurrentlyExecuting(): boolean {
    return this.isExecuting;
  }
}
