"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  List,
  Target,
  Zap,
  Settings
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { AgentPlan, AgentTask } from "@/lib/ai/tools/agent";

interface AgentDashboardProps {
  onCreateAgent?: (goal: string, options: AgentOptions) => void;
  isReadonly?: boolean;
}

interface AgentOptions {
  context?: string;
  constraints?: string[];
  priority: "low" | "medium" | "high" | "urgent";
  estimatedTime?: number;
  allowAutonomousExecution: boolean;
  maxTasks: number;
}

export function AgentDashboard({ onCreateAgent, isReadonly = false }: AgentDashboardProps) {
  const { t } = useTranslation();
  const [agents, setAgents] = useState<AgentPlan[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [agentOptions, setAgentOptions] = useState<AgentOptions>({
    priority: "medium",
    allowAutonomousExecution: true,
    maxTasks: 20
  });
  const [newGoal, setNewGoal] = useState("");
  const [newContext, setNewContext] = useState("");
  const [newConstraints, setNewConstraints] = useState("");

  const handleCreateAgent = async () => {
    if (!newGoal.trim() || isReadonly) return;

    setIsCreating(true);
    
    try {
      // Simulate agent creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock agent creation - replace with actual API call
      const newAgent = await createMockAgent(newGoal, agentOptions);
      setAgents(prev => [...prev, newAgent]);
      setSelectedAgent(newAgent);
      onCreateAgent?.(newGoal, agentOptions);
      
      // Reset form
      setNewGoal("");
      setNewContext("");
      setNewConstraints("");
    } catch (error) {
      console.error("Failed to create agent:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleExecuteTask = async (taskId: string) => {
    if (!selectedAgent || isReadonly) return;

    const task = selectedAgent.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Update task status to in_progress
    const updatedAgent = {
      ...selectedAgent,
      tasks: selectedAgent.tasks.map(t => 
        t.id === taskId ? { ...t, status: "in_progress" as const } : t
      )
    };
    setSelectedAgent(updatedAgent);
    setAgents(prev => prev.map(a => a.id === selectedAgent.id ? updatedAgent : a));

    // Simulate task execution
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Update task status to completed
    const completedAgent = {
      ...updatedAgent,
      tasks: updatedAgent.tasks.map(t => 
        t.id === taskId ? { 
          ...t, 
          status: "completed" as const,
          result: { message: `Task "${t.title}" completed successfully` }
        } : t
      )
    };

    // Update progress
    const completedTasks = completedAgent.tasks.filter(t => t.status === "completed").length;
    completedAgent.progress = (completedTasks / completedAgent.tasks.length) * 100;

    setSelectedAgent(completedAgent);
    setAgents(prev => prev.map(a => a.id === selectedAgent.id ? completedAgent : a));
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "research": return <Target className="w-4 h-4" />;
      case "analysis": return <List className="w-4 h-4" />;
      case "creation": return <Zap className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            {t("agentDashboard")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create New Agent */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">{t("createNewAgent")}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t("goal")}</label>
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder={t("enterGoal")}
                  disabled={isReadonly}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t("context")}</label>
                <Textarea
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  placeholder={t("enterContext")}
                  disabled={isReadonly}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("priority")}</label>
                  <Select
                    value={agentOptions.priority}
                    onValueChange={(value: any) => setAgentOptions(prev => ({ ...prev, priority: value }))}
                    disabled={isReadonly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("low")}</SelectItem>
                      <SelectItem value="medium">{t("medium")}</SelectItem>
                      <SelectItem value="high">{t("high")}</SelectItem>
                      <SelectItem value="urgent">{t("urgent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t("maxTasks")}</label>
                  <Select
                    value={agentOptions.maxTasks.toString()}
                    onValueChange={(value) => setAgentOptions(prev => ({ ...prev, maxTasks: parseInt(value) }))}
                    disabled={isReadonly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleCreateAgent}
                disabled={!newGoal.trim() || isCreating || isReadonly}
                className="w-full"
              >
                {isCreating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Bot className="w-4 h-4 mr-2" />
                  </motion.div>
                ) : (
                  <Bot className="w-4 h-4 mr-2" />
                )}
                {isCreating ? t("creating") : t("createAgent")}
              </Button>
            </div>
          </div>

          {/* Agent List */}
          {agents.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">{t("activeAgents")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <Card
                    key={agent.id}
                    className={`cursor-pointer transition-all ${
                      selectedAgent?.id === agent.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{agent.title}</h4>
                          <Badge className={getStatusColor(agent.status)}>
                            {t(agent.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {agent.description}
                        </p>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{t("progress")}</span>
                            <span>{Math.round(agent.progress)}%</span>
                          </div>
                          <Progress value={agent.progress} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{agent.tasks.length} {t("tasks")}</span>
                          <span>{agent.tasks.filter(t => t.status === "completed").length} {t("completed")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              {selectedAgent.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Agent Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedAgent.status)}>
                    {t(selectedAgent.status)}
                  </Badge>
                  <Badge className={getPriorityColor("medium")}>
                    {t("medium")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedAgent.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">{t("overallProgress")}</div>
                <Progress value={selectedAgent.progress} className="h-3" />
                <div className="text-xs text-muted-foreground">
                  {selectedAgent.tasks.filter(t => t.status === "completed").length} / {selectedAgent.tasks.length} {t("tasksCompleted")}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">{t("taskBreakdown")}</div>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">{selectedAgent.tasks.filter(t => t.status === "pending").length} {t("pending")}</Badge>
                  <Badge variant="outline">{selectedAgent.tasks.filter(t => t.status === "in_progress").length} {t("inProgress")}</Badge>
                  <Badge variant="outline">{selectedAgent.tasks.filter(t => t.status === "completed").length} {t("completed")}</Badge>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              <h3 className="font-semibold">{t("tasks")}</h3>
              <div className="space-y-3">
                {selectedAgent.tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {getTaskIcon(task.type)}
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge className={getStatusColor(task.status)}>
                              {t(task.status)}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {t(task.priority)}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          
                          {task.estimatedTime && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {task.estimatedTime} {t("minutes")}
                            </div>
                          )}
                          
                          {task.dependencies && task.dependencies.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {t("dependencies")}: {task.dependencies.length}
                            </div>
                          )}
                          
                          {task.result && (
                            <div className="p-2 bg-green-50 rounded text-sm">
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                {t("completed")}
                              </div>
                              <p className="text-green-700">{task.result.message}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {task.status === "pending" && !isReadonly && (
                            <Button
                              size="sm"
                              onClick={() => handleExecuteTask(task.id)}
                              className="min-w-[80px]"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              {t("execute")}
                            </Button>
                          )}
                          
                          {task.status === "in_progress" && (
                            <Button size="sm" variant="outline" disabled>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Settings className="w-3 h-3" />
                              </motion.div>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Mock agent creation function - replace with actual API call
async function createMockAgent(goal: string, options: AgentOptions): Promise<AgentPlan> {
  const agentId = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const tasks: AgentTask[] = [
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

  return {
    id: agentId,
    title: `Agent Plan: ${goal}`,
    description: options.context || `Autonomous execution plan for: ${goal}`,
    goal,
    tasks,
    status: options.allowAutonomousExecution ? "executing" : "planning",
    createdAt: new Date(),
    updatedAt: new Date(),
    progress: 0
  };
}
