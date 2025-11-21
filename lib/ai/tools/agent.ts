import { tool } from "ai";
import { z } from "zod";

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  type: "research" | "analysis" | "creation" | "organization" | "communication";
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "failed";
  estimatedTime?: number; // in minutes
  dependencies?: string[]; // task IDs that must be completed first
  subtasks?: AgentTask[];
  createdAt: Date;
  updatedAt: Date;
  result?: any;
  error?: string;
}

export interface AgentPlan {
  id: string;
  title: string;
  description: string;
  goal: string;
  tasks: AgentTask[];
  status: "planning" | "executing" | "completed" | "failed" | "paused";
  createdAt: Date;
  updatedAt: Date;
  progress: number; // 0-100
}

export const createAgent = tool({
  description:
    "Create an autonomous AI agent that can analyze goals, create tasks, and execute them independently. The agent can break down complex objectives into manageable tasks and execute them in the optimal order.",
  inputSchema: z.object({
    goal: z.string().describe("The main goal or objective the agent should accomplish"),
    context: z.string().optional().describe("Additional context about the goal and requirements"),
    constraints: z.array(z.string()).optional().describe("Any constraints or limitations the agent should consider"),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium").describe("Priority level of the overall goal"),
    estimatedTime: z.number().optional().describe("Estimated time in minutes to complete the goal"),
    allowAutonomousExecution: z.boolean().default(true).describe("Whether the agent can execute tasks without user confirmation"),
    maxTasks: z.number().min(1).max(50).default(20).describe("Maximum number of tasks the agent can create"),
  }),
  execute: async (input) => {
    try {
      // Create agent plan
      const agentPlan = await createAgentPlan(input);
      
      return {
        success: true,
        agentId: agentPlan.id,
        plan: agentPlan,
        message: `Agent created successfully with ${agentPlan.tasks.length} tasks for goal: "${input.goal}"`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create agent: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
});

export const executeAgentTask = tool({
  description:
    "Execute a specific task from an agent plan. This tool allows the agent to perform individual tasks and update their status.",
  inputSchema: z.object({
    agentId: z.string().describe("The ID of the agent"),
    taskId: z.string().describe("The ID of the task to execute"),
    parameters: z.record(z.any()).optional().describe("Additional parameters for task execution"),
  }),
  execute: async (input) => {
    try {
      const result = await performTaskExecution(input.agentId, input.taskId, input.parameters);
      
      return {
        success: true,
        taskId: input.taskId,
        result: result.result,
        status: result.status,
        message: `Task ${input.taskId} executed successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: `Task execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
});

export const updateAgentPlan = tool({
  description:
    "Update an agent plan based on new information, completed tasks, or changing requirements.",
  inputSchema: z.object({
    agentId: z.string().describe("The ID of the agent"),
    updates: z.object({
      addTasks: z.array(z.any()).optional().describe("New tasks to add to the plan"),
      removeTasks: z.array(z.string()).optional().describe("Task IDs to remove from the plan"),
      updateTaskStatus: z.array(z.object({
        taskId: z.string(),
        status: z.enum(["pending", "in_progress", "completed", "failed"]),
        result: z.any().optional(),
        error: z.string().optional()
      })).optional().describe("Tasks to update"),
      reprioritize: z.array(z.object({
        taskId: z.string(),
        priority: z.enum(["low", "medium", "high", "urgent"])
      })).optional().describe("Tasks to reprioritize"),
    }).describe("Updates to apply to the agent plan"),
  }),
  execute: async (input) => {
    try {
      const updatedPlan = await applyPlanUpdates(input.agentId, input.updates);
      
      return {
        success: true,
        agentId: input.agentId,
        plan: updatedPlan,
        message: "Agent plan updated successfully"
      };
    } catch (error) {
      return {
        success: false,
        error: `Plan update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
});

async function createAgentPlan(input: {
  goal: string;
  context?: string;
  constraints?: string[];
  priority: "low" | "medium" | "high" | "urgent";
  estimatedTime?: number;
  allowAutonomousExecution: boolean;
  maxTasks: number;
}): Promise<AgentPlan> {
  // This is a placeholder implementation
  // In a real application, you would use AI to analyze the goal and create an optimal plan
  
  const agentId = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Generate tasks based on the goal (mock implementation)
  const tasks = await generateTasksForGoal(input.goal, input.context, input.constraints, input.maxTasks);
  
  const plan: AgentPlan = {
    id: agentId,
    title: `Agent Plan: ${input.goal}`,
    description: input.context || `Autonomous execution plan for: ${input.goal}`,
    goal: input.goal,
    tasks,
    status: input.allowAutonomousExecution ? "executing" : "planning",
    createdAt: new Date(),
    updatedAt: new Date(),
    progress: 0
  };

  // Store the plan (in a real app, this would be saved to a database)
  agentPlans.set(agentId, plan);
  
  return plan;
}

async function generateTasksForGoal(
  goal: string,
  context?: string,
  constraints?: string[],
  maxTasks: number = 20
): Promise<AgentTask[]> {
  // Mock task generation - in reality, this would use AI to break down the goal
  const baseTasks: AgentTask[] = [
    {
      id: `task-${Date.now()}-1`,
      title: "Analyze requirements",
      description: `Analyze the requirements for: ${goal}`,
      type: "analysis",
      priority: "high",
      status: "pending",
      estimatedTime: 15,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: `task-${Date.now()}-2`,
      title: "Research relevant information",
      description: `Research information needed to accomplish: ${goal}`,
      type: "research",
      priority: "high",
      status: "pending",
      estimatedTime: 30,
      dependencies: [`task-${Date.now()}-1`],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: `task-${Date.now()}-3`,
      title: "Create execution plan",
      description: `Create a detailed execution plan for: ${goal}`,
      type: "organization",
      priority: "medium",
      status: "pending",
      estimatedTime: 20,
      dependencies: [`task-${Date.now()}-1`, `task-${Date.now()}-2`],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Add more specific tasks based on the goal type
  if (goal.toLowerCase().includes("research") || goal.toLowerCase().includes("study")) {
    baseTasks.push({
      id: `task-${Date.now()}-4`,
      title: "Gather data sources",
      description: "Identify and gather relevant data sources for research",
      type: "research",
      priority: "high",
      status: "pending",
      estimatedTime: 25,
      dependencies: [`task-${Date.now()}-1`],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  if (goal.toLowerCase().includes("create") || goal.toLowerCase().includes("build")) {
    baseTasks.push({
      id: `task-${Date.now()}-5`,
      title: "Create initial draft",
      description: "Create the initial draft or prototype",
      type: "creation",
      priority: "medium",
      status: "pending",
      estimatedTime: 45,
      dependencies: [`task-${Date.now()}-3`],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  return baseTasks.slice(0, maxTasks);
}

async function performTaskExecution(
  agentId: string,
  taskId: string,
  parameters?: Record<string, any>
): Promise<{ result: any; status: string }> {
  // Mock task execution - in reality, this would actually execute the task
  const plan = agentPlans.get(agentId);
  if (!plan) {
    throw new Error(`Agent plan not found: ${agentId}`);
  }

  const task = plan.tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }

  // Update task status
  task.status = "in_progress";
  task.updatedAt = new Date();

  // Simulate task execution
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock result based on task type
  let result: any;
  switch (task.type) {
    case "research":
      result = {
        findings: `Research findings for ${task.title}`,
        sources: ["source1.com", "source2.com"],
        confidence: 0.85
      };
      break;
    case "analysis":
      result = {
        analysis: `Analysis of ${task.title}`,
        insights: ["Insight 1", "Insight 2"],
        recommendations: ["Recommendation 1"]
      };
      break;
    case "creation":
      result = {
        created: `Created content for ${task.title}`,
        content: "Sample content...",
        format: "text"
      };
      break;
    default:
      result = { completed: true, message: `Task ${task.title} completed` };
  }

  task.status = "completed";
  task.result = result;
  task.updatedAt = new Date();

  // Update overall plan progress
  const completedTasks = plan.tasks.filter(t => t.status === "completed").length;
  plan.progress = (completedTasks / plan.tasks.length) * 100;
  plan.updatedAt = new Date();

  return { result, status: task.status };
}

async function applyPlanUpdates(
  agentId: string,
  updates: any
): Promise<AgentPlan> {
  const plan = agentPlans.get(agentId);
  if (!plan) {
    throw new Error(`Agent plan not found: ${agentId}`);
  }

  // Apply updates
  if (updates.addTasks) {
    plan.tasks.push(...updates.addTasks);
  }

  if (updates.removeTasks) {
    plan.tasks = plan.tasks.filter(task => !updates.removeTasks.includes(task.id));
  }

  if (updates.updateTaskStatus) {
    updates.updateTaskStatus.forEach((update: any) => {
      const task = plan.tasks.find(t => t.id === update.taskId);
      if (task) {
        task.status = update.status;
        if (update.result) task.result = update.result;
        if (update.error) task.error = update.error;
        task.updatedAt = new Date();
      }
    });
  }

  if (updates.reprioritize) {
    updates.reprioritize.forEach((update: any) => {
      const task = plan.tasks.find(t => t.id === update.taskId);
      if (task) {
        task.priority = update.newPriority;
        task.updatedAt = new Date();
      }
    });
  }

  // Update progress
  const completedTasks = plan.tasks.filter(t => t.status === "completed").length;
  plan.progress = (completedTasks / plan.tasks.length) * 100;
  plan.updatedAt = new Date();

  return plan;
}

// In-memory storage for agent plans (in a real app, use a database)
const agentPlans = new Map<string, AgentPlan>();

// Helper functions for direct calls (not as tools)
export async function createMockAgent(input: any): Promise<{ success: boolean; plan?: AgentPlan; error?: string }> {
  try {
    // Direct implementation instead of calling tool.execute
    const agentPlan = await createAgentPlan(input);
    
    return {
      success: true,
      plan: agentPlan
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function executeMockAgentTask(input: any): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    // Direct implementation instead of calling tool.execute
    const { agentId, taskId } = input;
    
    // Mock task execution - in reality, this would actually execute the task
    const plan = agentPlans.get(agentId);
    if (!plan) {
      throw new Error(`Agent plan not found: ${agentId}`);
    }

    const task = plan.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Update task status
    task.status = "in_progress";
    task.updatedAt = new Date();

    // Simulate task execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock result based on task type
    let result: any;
    switch (task.type) {
      case "research":
        result = {
          findings: `Research findings for ${task.title}`,
          sources: ["source1.com", "source2.com"],
          confidence: 0.85
        };
        break;
      case "analysis":
        result = {
          analysis: `Analysis of ${task.title}`,
          insights: ["Insight 1", "Insight 2"],
          recommendations: ["Recommendation 1"]
        };
        break;
      case "creation":
        result = {
          created: `Created content for ${task.title}`,
          content: "Sample content...",
          format: "text"
        };
        break;
      default:
        result = { completed: true, message: `Task ${task.title} completed` };
    }

    task.status = "completed";
    task.result = result;
    task.updatedAt = new Date();

    return {
      success: true,
      result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function updateMockAgentPlan(input: any): Promise<AgentPlan> {
  try {
    // Direct implementation instead of calling tool.execute
    const { agentId, updates } = input;
    
    // Get existing plan
    const plan = agentPlans.get(agentId);
    if (!plan) {
      throw new Error(`Agent plan not found: ${agentId}`);
    }

    // Apply updates
    if (updates.addTasks) {
      plan.tasks.push(...updates.addTasks);
    }

    if (updates.removeTasks) {
      plan.tasks = plan.tasks.filter(task => !updates.removeTasks!.includes(task.id));
    }

    if (updates.updateTaskStatus) {
      for (const update of updates.updateTaskStatus) {
        const task = plan.tasks.find(t => t.id === update.taskId);
        if (task) {
          task.status = update.status;
          task.updatedAt = new Date();
          if (update.error) task.error = update.error;
          if (update.result) task.result = update.result;
        }
      }
    }

    if (updates.reprioritize) {
      for (const update of updates.reprioritize) {
        const task = plan.tasks.find(t => t.id === update.taskId);
        if (task) {
          task.priority = update.newPriority;
          task.updatedAt = new Date();
        }
      }
    }

    // Update progress
    const completedTasks = plan.tasks.filter(t => t.status === "completed").length;
    plan.progress = (completedTasks / plan.tasks.length) * 100;
    plan.updatedAt = new Date();

    // Update overall status
    if (plan.tasks.every(t => t.status === "completed")) {
      plan.status = "completed";
    } else if (plan.tasks.some(t => t.status === "failed")) {
      plan.status = "failed";
    } else if (plan.tasks.some(t => t.status === "in_progress")) {
      plan.status = "executing";
    }

    return plan;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to update agent plan");
  }
}
