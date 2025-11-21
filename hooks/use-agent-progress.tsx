"use client";

import { useState, useEffect, useCallback } from "react";
import type { AgentPlan } from "@/lib/ai/tools/agent";
import { AgentEngine } from "@/lib/ai/agent-engine";

interface UseAgentProgressReturn {
  activeAgent: AgentPlan | null;
  showAgentProgress: boolean;
  isExecuting: boolean;
  startAgent: (goal: string, context?: string, constraints?: string[], webSearchEnabled?: boolean, maxTasks?: number) => Promise<void>;
  stopAgent: () => void;
  pauseAgent: () => void;
  resumeAgent: () => void;
  updateAgentProgress: (agentId: string, updates: Partial<AgentPlan>) => void;
}

export function useAgentProgress(): UseAgentProgressReturn {
  const [activeAgent, setActiveAgent] = useState<AgentPlan | null>(null);
  const [showAgentProgress, setShowAgentProgress] = useState(false);
  const [agentEngine, setAgentEngine] = useState<AgentEngine | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const startAgent = useCallback(async (
    goal: string, 
    context?: string, 
    constraints?: string[], 
    webSearchEnabled = false,
    maxTasks = 10
  ) => {
    if (isExecuting) return;

    setIsExecuting(true);
    setShowAgentProgress(true);

    try {
      const engine = new AgentEngine({
        goal,
        context,
        constraints,
        webSearchEnabled,
        maxTasks,
        onProgressUpdate: (agent) => {
          setActiveAgent(agent);
        },
        onTaskStart: (task) => {
          console.log(`Starting task: ${task.title}`);
        },
        onTaskComplete: (task, result) => {
          console.log(`Completed task: ${task.title}`, result);
        },
        onAgentComplete: (agent) => {
          console.log('Agent execution completed', agent);
          setTimeout(() => {
            setShowAgentProgress(false);
            setActiveAgent(null);
            setIsExecuting(false);
          }, 5000);
        }
      });

      setAgentEngine(engine);
      await engine.startExecution();
    } catch (error) {
      console.error('Agent execution failed:', error);
      setIsExecuting(false);
      setShowAgentProgress(false);
    }
  }, [isExecuting]);

  const stopAgent = useCallback(() => {
    if (agentEngine) {
      agentEngine.stopExecution();
      setIsExecuting(false);
      
      setTimeout(() => {
        setShowAgentProgress(false);
        setActiveAgent(null);
        setAgentEngine(null);
      }, 2000);
    }
  }, [agentEngine]);

  const pauseAgent = useCallback(() => {
    if (agentEngine) {
      agentEngine.pauseExecution();
      setIsExecuting(false);
    }
  }, [agentEngine]);

  const resumeAgent = useCallback(() => {
    if (agentEngine) {
      agentEngine.resumeExecution();
      setIsExecuting(true);
    }
  }, [agentEngine]);

  const updateAgentProgress = useCallback((agentId: string, updates: Partial<AgentPlan>) => {
    setActiveAgent(prev => 
      prev && prev.id === agentId 
        ? { ...prev, ...updates, updatedAt: new Date() }
        : prev
    );
  }, []);

  return {
    activeAgent,
    showAgentProgress,
    isExecuting,
    startAgent,
    stopAgent,
    pauseAgent,
    resumeAgent,
    updateAgentProgress
  };
}
