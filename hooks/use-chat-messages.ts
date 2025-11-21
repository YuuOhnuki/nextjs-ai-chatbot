"use client";
import { useCallback, useMemo } from "react";
import useSWR, { type SWRConfiguration } from "swr";
import { fetcher } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import type { Vote } from "@/lib/db/schema";

interface UseChatMessagesOptions extends SWRConfiguration {
  chatId: string;
  initialMessages?: ChatMessage[];
}

interface ChatMessagesResponse {
  messages: ChatMessage[];
  votes: Vote[];
}

export function useChatMessages({ chatId, initialMessages, ...swrConfig }: UseChatMessagesOptions) {
  const { data, error, mutate, isLoading } = useSWR<ChatMessagesResponse>(
    chatId ? `/api/chat/${chatId}` : null,
    fetcher,
    {
      fallbackData: initialMessages ? { messages: initialMessages, votes: [] } : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      ...swrConfig,
    }
  );

  const messages = useMemo(() => data?.messages || [], [data?.messages]);
  const votes = useMemo(() => data?.votes || [], [data?.votes]);

  const getVoteForMessage = useCallback(
    (messageId: string) => votes.find((vote) => vote.messageId === messageId),
    [votes]
  );

  const addMessage = useCallback(
    (newMessage: ChatMessage) => {
      mutate(
        (current) => ({
          messages: [...(current?.messages || []), newMessage],
          votes: current?.votes || [],
        }),
        false
      );
    },
    [mutate]
  );

  const updateMessage = useCallback(
    (messageId: string, updates: Partial<ChatMessage>) => {
      mutate(
        (current) => ({
          messages: current?.messages.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ) || [],
          votes: current?.votes || [],
        }),
        false
      );
    },
    [mutate]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      mutate(
        (current) => ({
          messages: current?.messages.filter((msg) => msg.id !== messageId) || [],
          votes: current?.votes || [],
        }),
        false
      );
    },
    [mutate]
  );

  return {
    messages,
    votes,
    error,
    isLoading,
    mutate,
    getVoteForMessage,
    addMessage,
    updateMessage,
    deleteMessage,
  };
}
