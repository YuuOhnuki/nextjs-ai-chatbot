"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Zap,
  Brain,
  Search,
  List,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { AgentPlan, AgentTask } from "@/lib/ai/tools/agent";

interface AgentProgressProps {
  agent: AgentPlan;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export function AgentProgress({ 
  agent, 
  onPause, 
  onResume, 
  onStop, 
  isExpanded = false,
  onToggleExpanded 
}: AgentProgressProps) {
  const { t } = useTranslation();
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Find current executing task
  const currentTask = agent.tasks.find(task => task.status === "in_progress");
  const completedTasks = agent.tasks.filter(task => task.status === "completed");
  const pendingTasks = agent.tasks.filter(task => task.status === "pending");

  useEffect(() => {
    // Simulate task progress animation
    if (agent.status === "executing") {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [agent.status, currentTask]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "research": return <Search className="w-4 h-4" />;
      case "analysis": return <Brain className="w-4 h-4" />;
      case "creation": return <Zap className="w-4 h-4" />;
      case "organization": return <List className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getAgentStatusIcon = () => {
    switch (agent.status) {
      case "executing":
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Bot className="w-5 h-5 text-blue-600" />
          </motion.div>
        );
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "paused":
        return <Pause className="w-5 h-5 text-orange-600" />;
      default:
        return <Bot className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <Card className="w-full border-2 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getAgentStatusIcon()}
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {t("agentExecution")}
                {agent.status === "executing" && (
                  <motion.div
                    className="flex items-center gap-1"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span className="text-sm text-blue-600">{t("executing")}</span>
                  </motion.div>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{agent.title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Control Buttons */}
            {agent.status === "executing" && onPause && (
              <Button size="sm" variant="outline" onClick={onPause}>
                <Pause className="w-3 h-3" />
              </Button>
            )}
            {agent.status === "paused" && onResume && (
              <Button size="sm" variant="outline" onClick={onResume}>
                <Play className="w-3 h-3" />
              </Button>
            )}
            {(agent.status === "executing" || agent.status === "paused") && onStop && (
              <Button size="sm" variant="outline" onClick={onStop}>
                <Square className="w-3 h-3" />
              </Button>
            )}
            
            {/* Expand/Collapse Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleExpanded}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("overallProgress")}</span>
            <span>{Math.round(agent.progress)}%</span>
          </div>
          <Progress value={agent.progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedTasks.length} {t("completed")}</span>
            <span>{pendingTasks.length} {t("pending")}</span>
            <span>{agent.tasks.length} {t("total")}</span>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pt-0 space-y-4">
              {/* Current Task Focus */}
              {currentTask && (
                <motion.div
                  className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getTaskIcon(currentTask.type)}
                    <span className="font-medium text-blue-800">{t("currentlyExecuting")}</span>
                    <Badge className={getStatusColor(currentTask.status)}>
                      {t(currentTask.status)}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-blue-900 mb-1">{currentTask.title}</h4>
                  <p className="text-sm text-blue-700">{currentTask.description}</p>
                  {currentTask.estimatedTime && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                      <Clock className="w-3 h-3" />
                      {t("estimatedTime")}: {currentTask.estimatedTime} {t("minutes")}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Task List */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{t("taskList")}</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {agent.tasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border ${
                        task.status === "in_progress" 
                          ? "bg-blue-100 border-blue-300" 
                          : task.status === "completed"
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getTaskIcon(task.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{task.title}</span>
                            <Badge className={getStatusColor(task.status)} variant="outline">
                              {t(task.status)}
                            </Badge>
                          </div>
                          {task.status === "completed" && task.result && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ {task.result.message || t("taskCompleted")}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Agent Activity Log */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{t("activityLog")}</h4>
                <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1 max-h-32 overflow-y-auto">
                  <div className="text-muted-foreground">
                    {new Date().toLocaleTimeString()} - {t("agentStarted")}
                  </div>
                  {completedTasks.map((task, index) => (
                    <div key={task.id} className="text-green-600">
                      {new Date().toLocaleTimeString()} - ✓ {task.title}
                    </div>
                  ))}
                  {currentTask && (
                    <div className="text-blue-600 animate-pulse">
                      {new Date().toLocaleTimeString()} - 🔄 {currentTask.title}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// Compact version for minimal space
export function CompactAgentProgress({ agent }: { agent: AgentPlan }) {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "executing": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "failed": return "bg-red-500";
      case "paused": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Bot className="w-4 h-4 text-blue-600" />
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{agent.title}</span>
          <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
        </div>
        <div className="text-xs text-muted-foreground">
          {Math.round(agent.progress)}% {t("complete")}
        </div>
      </div>
    </div>
  );
}
